terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40"
    }
  }

  # State lưu ở S3 — phải tạo bucket này TRƯỚC (xem README.md)
  backend "s3" {
    bucket         = "chb-tf-state-vi-2026"
    key            = "coffee-home-blend/terraform.tfstate"
    region         = "ap-southeast-1"
    encrypt        = true
    dynamodb_table = "chb-tf-lock" # tùy chọn, tạo riêng nếu cần lock
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "coffee-home-blend"
      Environment = var.environment
      ManagedBy   = "terraform"
      Owner       = "Hungg212"
    }
  }
}
