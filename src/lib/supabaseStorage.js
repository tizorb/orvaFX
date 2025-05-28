
    import { supabase } from '@/lib/supabaseClient';

    async function baseConfigureBucket(bucketName, { public: isPublic, allowedMimeTypes, fileSizeLimit }) {
      const { data, error } = await supabase
        .storage
        .updateBucket(bucketName, {
          public: isPublic,
          allowedMimeTypes: allowedMimeTypes,
          fileSizeLimit: fileSizeLimit,
        });

      if (error) {
        console.error(`Error updating bucket ${bucketName} settings:`, error);
        
        if (error.message?.includes("new row violates row-level security policy for table \"buckets\"")) {
          console.warn(`RLS policy might be preventing bucket update for ${bucketName}. Ensure anon key has permissions or bucket exists.`);
        } else if (error.message?.includes("Bucket not found")) {
          console.log(`Bucket ${bucketName} not found. Attempting to create it.`);
          const { data: createData, error: createError } = await supabase
            .storage
            .createBucket(bucketName, {
              public: isPublic,
              allowedMimeTypes: allowedMimeTypes,
              fileSizeLimit: fileSizeLimit,
            });
          if (createError) {
            console.error(`Error creating bucket ${bucketName}:`, createError);
            throw createError;
          }
          console.log(`Bucket ${bucketName} created successfully.`, createData);
          return createData;
        } else {
          throw error;
        }
      }
      return data;
    }

    export async function configureBucketCORS(bucketName, configOptions, allowedOrigins = []) {
      try {
        await baseConfigureBucket(bucketName, configOptions);

        const defaultOrigins = [
          'http://localhost:5173',
          'https://*.app-preview.com', 
        ];
        
        const uniqueOrigins = [...new Set([...defaultOrigins, ...allowedOrigins])];
        
        if (uniqueOrigins.includes('https://tu-dominio.com') && allowedOrigins.includes('https://tu-dominio.com')) {
           const index = uniqueOrigins.indexOf('https://tu-dominio.com');
           if (index > -1 && uniqueOrigins.filter(o => o === 'https://tu-dominio.com').length > 1) {
             uniqueOrigins.splice(index, 1);
           }
        }


        const { error: corsError } = await supabase
          .storage
          .setCorsConfig(bucketName, [ 
            {
              allowedOrigins: uniqueOrigins,
              allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
              allowedHeaders: ['Authorization', 'X-Client-Info', 'apikey', 'Content-Type', 'x-upsert'],
              exposeHeaders: ['Content-Length', 'X-Supabase-Version'],
              maxAgeSeconds: 3600,
            },
          ]);

        if (corsError) {
          console.error(`Error setting CORS for bucket ${bucketName}:`, corsError);
          throw corsError;
        }

        console.log(`CORS configured successfully for bucket ${bucketName} with origins: ${uniqueOrigins.join(', ')}`);
        return { success: true };
      } catch (error) {
        console.error(`Error in configureBucketCORS for ${bucketName}:`, error);
        return {
          success: false,
          error: error.message,
        };
      }
    }

    export async function configureDefaultBuckets() {
      console.log("Attempting to configure default buckets...");
      const buckets = [
        { name: 'avatars', config: { public: true, allowedMimeTypes: ['image/*'], fileSizeLimit: 1024 * 1024 * 2 }, allowedOrigins: ['https://tu-dominio.com'] },
        { name: 'payment-proofs', config: { public: false, allowedMimeTypes: ['image/*', 'application/pdf'], fileSizeLimit: 1024 * 1024 * 5 }, allowedOrigins: ['https://tu-dominio.com'] },
        { name: 'documents', config: { public: false, allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], fileSizeLimit: 1024 * 1024 * 10 }, allowedOrigins: ['https://tu-dominio.com'] },
        { name: 'products', config: { public: true, allowedMimeTypes: ['image/*'], fileSizeLimit: 1024 * 1024 * 3 }, allowedOrigins: ['https://tu-dominio.com'] }
      ];

      let allSuccessful = true;
      for (const bucket of buckets) {
        console.log(`Configuring bucket: ${bucket.name}`);
        const result = await configureBucketCORS(
          bucket.name,
          bucket.config,
          bucket.allowedOrigins
        );
        
        if (!result.success) {
          allSuccessful = false;
          console.warn(`Failed to configure bucket ${bucket.name}. Error: ${result.error}`);
        } else {
          console.log(`Bucket ${bucket.name} configured successfully.`);
        }
      }

      if (allSuccessful) {
        console.log("All default buckets configured successfully.");
      } else {
        console.warn("Some default buckets could not be configured. Check logs for details.");
      }
    }
  