# javascript-opentimestamp-awslambda
OpenTimestamps lambda function to timestamp automatically your files on S3 bucket

### Build the package
Build a .zip package to upload on your AWS lambda platform
```
git clone https://github.com/lvaccaro/javascript-opentimestamp-awslambda
cd javascript-opentimestamp-awslambda
npm install
zip -r ../javascript-opentimestamp-awslambda.zip ./*
```

### Configuration
In AWS lambda is not possible blacklist some files based on filename, 
so your S3 bucket must have 2 main folder:
* uploads: to store the upload files to timestamp (srcDir).
* proofs: to store all the timestamped proofs (dstDir).

In index.js you have to set the srcDir/dstDir based on your dir name.
