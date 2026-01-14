#!/bin/bash

# Configuration - 
PROJECT_ID="rest-api-$(head /dev/urandom | tr -dc a-z0-9 | head -c 6)"
BUCKET_NAME="tf-state-$PROJECT_ID"
TABLE_NAME="tf-lock-$PROJECT_ID"
REGION="us-east-1" # Recommended default

echo "🚀 Starting setup for S3 Bucket: $BUCKET_NAME..."

# 1. Create S3 Bucket
# Note: us-east-1 behaves differently and does not allow LocationConstraint
if [ "$REGION" == "us-east-1" ]; then
    aws s3api create-bucket \
        --bucket "$BUCKET_NAME" \
        --region "$REGION"
else
    aws s3api create-bucket \
        --bucket "$BUCKET_NAME" \
        --region "$REGION" \
        --create-bucket-configuration LocationConstraint="$REGION"
fi

if [ $? -eq 0 ]; then
    echo "✅ S3 Bucket created successfully."
else
    echo "❌ Failed to create S3 bucket. It might already exist or name is taken."
    exit 1
fi

# 2. Enable Versioning (Crucial for Terraform State)
aws s3api put-bucket-versioning \
    --bucket "$BUCKET_NAME" \
    --versioning-configuration Status=Enabled

echo "✅ S3 Versioning enabled."

# 3. Create DynamoDB Table for Locking
echo "🚀 Creating DynamoDB Table: $TABLE_NAME..."
aws dynamodb create-table \
    --table-name "$TABLE_NAME" \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --region "$REGION"

if [ $? -eq 0 ]; then
    echo "✅ DynamoDB Table created."
else
    echo "❌ Failed to create DynamoDB table."
    exit 1
fi

echo ""
echo "------------------------------------------------------"
echo "🎉 SETUP COMPLETE!"
echo "------------------------------------------------------"
echo "Add these to your GitHub Repository Secrets:"
echo "TF_STATE_BUCKET: $BUCKET_NAME"
echo "TF_STATE_TABLE: $TABLE_NAME"
echo "------------------------------------------------------"
