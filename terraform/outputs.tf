output "alb_dns_name" {
  description = "DNS của ALB — truy cập thử ở đây"
  value       = aws_lb.app.dns_name
}

output "artifact_bucket" {
  value = aws_s3_bucket.artifact.bucket
}

output "asg_name" {
  value = aws_autoscaling_group.app.name
}

output "vpc_id" {
  value = aws_vpc.main.id
}
