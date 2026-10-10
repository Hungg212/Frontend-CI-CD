resource "aws_s3_bucket" "artifact" {
  bucket = var.artifact_bucket_name
  force_destroy = true # chỉ dev, production để false

  tags = { Purpose = "jenkins-artifact" }
}

resource "aws_s3_bucket_public_access_block" "artifact" {
  bucket = aws_s3_bucket.artifact.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
