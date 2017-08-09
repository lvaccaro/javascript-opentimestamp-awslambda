'use strict';

const async = require('async');
const OpenTimestamps = require('javascript-opentimestamps');
const AWS = require('aws-sdk');
const util = require('util');
const s3 = new AWS.S3();

const srcDir = "uploads";
const dstDir = "proof";


exports.handler = (event, context, callback) => {
    
    // Read options from the event.
    console.log("Reading options from event:\n", util.inspect(event, {depth: 5}));
    var srcBucket = event.Records[0].s3.bucket.name;
    var dstBucket = event.Records[0].s3.bucket.name;
    // Object key may have spaces or unicode non-ASCII characters.
    var srcKey    = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));  
    var dstKey    = srcKey.replace(srcDir, dstDir) + ".ots";
    console.log(srcKey);
    console.log(dstKey);
    
     async.waterfall([
        function download(next) {
            // Download the image from S3 into a buffer.
            s3.getObject({
                    Bucket: srcBucket,
                    Key: srcKey
                },
                next);
            },
        function timestamp(response, next) {
        	const file = Buffer.from(response.Body);
			const detached = OpenTimestamps.DetachedTimestampFile.fromBytes(new OpenTimestamps.Ops.OpSHA256(), file);
			OpenTimestamps.stamp(detached).then( ()=>{
  				const infoResult = OpenTimestamps.info(detached);
  				console.log(infoResult);
  				
  				const ctx = new OpenTimestamps.Context.StreamSerialization();
        		detached.serialize(ctx);
        		const buffer = new Buffer(ctx.getOutput());
  				next(null,'application/octet-stream', buffer);
			});
        },
        function upload(contentType, data, next) {
        
            // Stream the transformed image to a different S3 bucket.
            s3.putObject({
                    Bucket: dstBucket,
                    Key: dstKey,
                    Body: data,
                    ContentType: contentType
                },
                next);
            }
        ], function (err) {
            if (err) {
                console.error(
                    'Unable to timestamp ' + srcBucket + '/' + srcKey +
                    ' and upload to ' + dstBucket + '/' + dstKey +
                    ' due to an error: ' + err
                );
            } else {
                console.log(
                    'Successfully timestamp ' + srcBucket + '/' + srcKey +
                    ' and uploaded to ' + dstBucket + '/' + dstKey
                );
            }

            callback(null, "message");
        }
    );
}
        
        