variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-southeast-1" # Singapore — gần VN nhất
}

variable "environment" {
  description = "Môi trường (dev/staging/prod)"
  type        = string
  default     = "staging"
}

variable "project_name" {
  type    = string
  default = "coffee-home-blend"
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "2 CIDR cho 2 AZ (multi-AZ bắt buộc cho ALB)"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "instance_type" {
  type    = string
  default = "t3.micro" # free tier
}

variable "key_pair_name" {
  description = "Tên EC2 KeyPair đã tạo sẵn ở AWS console"
  type        = string
  # ví dụ: "chb-keypair"
}

variable "min_size" {
  type    = number
  default = 2
}

variable "max_size" {
  type    = number
  default = 4
}

variable "desired_capacity" {
  type    = number
  default = 2
}

variable "artifact_bucket_name" {
  description = "Tên S3 bucket chứa dist/ từ Jenkins"
  type        = string
  default     = "chb-artifacts-vi-2026"
}
