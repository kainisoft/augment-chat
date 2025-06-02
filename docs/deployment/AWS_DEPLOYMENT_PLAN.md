# AWS Deployment Plan

## Overview
This document outlines the AWS infrastructure and deployment strategy for the chat application, including container orchestration, databases, and CI/CD pipeline.

## AWS Architecture

### Infrastructure Components
- **Container Orchestration**: AWS ECS or EKS
- **Databases**:
  - AWS RDS for PostgreSQL
  - DocumentDB or MongoDB Atlas for MongoDB
- **Message Broker**: AWS MSK (managed Kafka)
- **Storage**: AWS S3 for file attachments
- **CDN**: CloudFront for static assets
- **Caching**: Custom Redis Cluster on EC2 instances (accessed via private IPs)
- **CI/CD**: AWS CodePipeline or GitHub Actions
- **Monitoring**: CloudWatch, X-Ray
- **Security**: WAF, Shield, AWS IAM

### Architecture Diagram
```
                                   ┌─────────────┐
                                   │  CloudFront │
                                   └──────┬──────┘
                                          │
                                          ▼
┌─────────────┐                    ┌─────────────┐                    ┌─────────────┐
│     S3      │◄───────────────────┤ Application ├───────────────────►│    WAF      │
│  (Static    │                    │ Load        │                    │  (Security) │
│   Assets)   │                    │ Balancer    │                    │             │
└─────────────┘                    └──────┬──────┘                    └─────────────┘
                                          │
                                          ▼
                                   ┌─────────────┐
                                   │    ECS      │
                                   │    or       │
                                   │    EKS      │
                                   └──────┬──────┘
                                          │
                 ┌────────────────┬───────┴───────┬────────────────┐
                 │                │               │                │
                 ▼                ▼               ▼                ▼
        ┌─────────────┐   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
        │ API Gateway │   │ Auth Service│ │ User Service│ │ Chat Service│
        │ Container   │   │ Container   │ │ Container   │ │ Container   │
        └──────┬──────┘   └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
               │                 │                │               │
               └────────┬────────┴────────┬───────┴───────┬──────┘
                        │                 │               │
                        ▼                 ▼               ▼
               ┌─────────────┐    ┌─────────────┐ ┌─────────────┐
               │    RDS      │    │ DocumentDB  │ │    MSK      │
               │ (PostgreSQL)│    │ (MongoDB)   │ │   (Kafka)   │
               └─────────────┘    └─────────────┘ └─────────────┘
```

## Infrastructure as Code

### Terraform Modules
- **VPC Module**: Network configuration
- **ECS/EKS Module**: Container orchestration
- **RDS Module**: PostgreSQL database
- **DocumentDB Module**: MongoDB database
- **MSK Module**: Kafka message broker
- **S3 Module**: File storage
- **CloudFront Module**: CDN configuration
- **EC2 Module**: For custom Redis Cluster instances
- **AWS IAM Module**: Security and permissions
- **Monitoring Module**: CloudWatch and alerting

### Custom Redis Cluster Implementation
- **Architecture**:
  - 6 EC2 instances (3 master, 3 replica) across 3 availability zones
  - t3.medium instances for production (t3.micro for staging)
  - Private subnet placement with no public IP addresses
  - Security groups allowing only internal VPC traffic on Redis ports
- **Configuration**:
  - Redis Cluster mode enabled for sharding
  - Persistence configured with both RDB snapshots and AOF logs
  - Automatic failover between masters and replicas
  - Private IP addressing for all inter-node communication
- **Deployment**:
  - Automated deployment using Terraform and Ansible
  - Custom AMI with Redis pre-installed and optimized
  - Configuration management through version-controlled templates
- **Monitoring**:
  - CloudWatch agent for Redis metrics collection
  - Custom dashboard for Redis Cluster health
  - Alerts for node failures, memory usage, and replication lag
- **Backup Strategy**:
  - Automated daily backups to S3
  - Point-in-time recovery through AOF logs
  - Backup rotation policy (7 daily, 4 weekly, 3 monthly)

### Example Terraform Configuration (Simplified)
```hcl
module "vpc" {
  source = "./modules/vpc"
  name   = "chat-app-vpc"
  cidr   = "10.0.0.0/16"
  azs    = ["us-west-2a", "us-west-2b", "us-west-2c"]
}

module "ecs" {
  source            = "./modules/ecs"
  name              = "chat-app-cluster"
  vpc_id            = module.vpc.vpc_id
  private_subnets   = module.vpc.private_subnets
  public_subnets    = module.vpc.public_subnets
  container_insights = true
}

module "rds" {
  source              = "./modules/rds"
  name                = "chat-app-postgres"
  engine              = "postgres"
  engine_version      = "14"
  instance_class      = "db.t3.medium"
  allocated_storage   = 20
  vpc_id              = module.vpc.vpc_id
  subnet_ids          = module.vpc.database_subnets
  multi_az            = true
}

module "documentdb" {
  source              = "./modules/documentdb"
  name                = "chat-app-mongodb"
  instance_class      = "db.t3.medium"
  vpc_id              = module.vpc.vpc_id
  subnet_ids          = module.vpc.database_subnets
}

module "msk" {
  source              = "./modules/msk"
  name                = "chat-app-kafka"
  kafka_version       = "2.8.1"
  number_of_broker_nodes = 3
  vpc_id              = module.vpc.vpc_id
  subnet_ids          = module.vpc.private_subnets
}

module "s3" {
  source              = "./modules/s3"
  name                = "chat-app-files"
  versioning_enabled  = true
}

module "cloudfront" {
  source              = "./modules/cloudfront"
  name                = "chat-app-cdn"
  s3_origin_id        = module.s3.bucket_id
  s3_origin_domain_name = module.s3.bucket_domain_name
}

module "redis_cluster" {
  source              = "./modules/ec2"
  name                = "chat-app-redis-cluster"
  instance_count      = 6
  instance_type       = "t3.medium"
  ami_id              = "ami-redis-custom"
  subnet_ids          = module.vpc.private_subnets
  vpc_id              = module.vpc.vpc_id
  key_name            = "redis-cluster-key"
  security_groups     = [module.redis_sg.security_group_id]
  user_data           = file("./scripts/redis-init.sh")
  tags = {
    Role = "redis-cluster"
  }
}
```

## CI/CD Pipeline

### Pipeline Stages
1. **Source**: Pull code from GitHub repository
2. **Build**:
   - Build Docker images for each service
   - Run unit tests
   - Run code quality checks
3. **Test**:
   - Deploy to test environment
   - Run integration tests
   - Run end-to-end tests
4. **Deploy**:
   - Deploy to staging environment
   - Run smoke tests
   - Deploy to production environment
   - Run post-deployment verification

### AWS CodePipeline Configuration
```yaml
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 18
    commands:
      - npm install -g pnpm
      - pnpm install

  pre_build:
    commands:
      - echo Logging in to Amazon ECR...
      - aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com
      - COMMIT_HASH=$(echo $CODEBUILD_RESOLVED_SOURCE_VERSION | cut -c 1-7)
      - IMAGE_TAG=${COMMIT_HASH:=latest}

  build:
    commands:
      - echo Build started on `date`
      - echo Building the Docker images...
      - docker build -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/api-gateway:$IMAGE_TAG -f docker/Dockerfiles/api-gateway.Dockerfile .
      - docker build -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/auth-service:$IMAGE_TAG -f docker/Dockerfiles/auth-service.Dockerfile .
      - docker build -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/user-service:$IMAGE_TAG -f docker/Dockerfiles/user-service.Dockerfile .
      - docker build -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/chat-service:$IMAGE_TAG -f docker/Dockerfiles/chat-service.Dockerfile .
      - docker build -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/notification-service:$IMAGE_TAG -f docker/Dockerfiles/notification-service.Dockerfile .
      - echo Running tests...
      - pnpm test

  post_build:
    commands:
      - echo Build completed on `date`
      - echo Pushing the Docker images...
      - docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/api-gateway:$IMAGE_TAG
      - docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/auth-service:$IMAGE_TAG
      - docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/user-service:$IMAGE_TAG
      - docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/chat-service:$IMAGE_TAG
      - docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/notification-service:$IMAGE_TAG
      - echo Writing image definitions file...
      - aws cloudformation deploy --template-file infrastructure/ecs-task-definitions.yaml --stack-name chat-app-ecs-tasks --parameter-overrides ImageTag=$IMAGE_TAG

artifacts:
  files:
    - infrastructure/**/*
    - appspec.yml
    - taskdef.json
```

## Deployment Strategy

### Blue-Green Deployment
1. **Preparation**:
   - Create new "green" environment with updated services
   - Deploy new version to green environment
   - Run smoke tests on green environment
2. **Transition**:
   - Gradually shift traffic from blue to green environment
   - Monitor for errors during transition
3. **Completion**:
   - Complete traffic shift to green environment
   - Keep blue environment as fallback
   - After confirmation, decommission blue environment

### Rollback Strategy
1. **Automated Rollback Triggers**:
   - Error rate exceeds threshold
   - Latency exceeds threshold
   - Failed health checks
2. **Rollback Process**:
   - Shift traffic back to blue environment
   - Notify team of rollback
   - Preserve logs and metrics for debugging

## Monitoring and Logging

### CloudWatch Dashboards
- Service health metrics
- API response times
- Database performance
- Message broker throughput
- Error rates and status codes

### Alerting
- **High Priority**:
  - Service outages
  - Database connectivity issues
  - High error rates
- **Medium Priority**:
  - Elevated latency
  - Increased resource utilization
  - Abnormal traffic patterns
- **Low Priority**:
  - Non-critical warnings
  - Resource optimization opportunities

### Logging Strategy
- Centralized logging with CloudWatch Logs
- Structured JSON log format
- Log retention policies
- Log-based metrics and alerts

## Security Measures

### Network Security
- VPC with private subnets for services
- Security groups with least privilege
- Network ACLs for additional protection
- VPN for administrative access

### Data Security
- Encryption at rest for all databases
- Encryption in transit with TLS
- AWS IAM roles with least privilege
- Secrets management with AWS Secrets Manager

### Compliance
- Regular security audits
- Automated vulnerability scanning
- Compliance with relevant standards (e.g., GDPR, SOC2)
- Security incident response plan

## Implementation Tasks

### Phase 1: Infrastructure Setup
- [ ] Create Terraform modules for core infrastructure
- [ ] Set up VPC and networking
- [ ] Configure security groups and AWS IAM roles
- [ ] Deploy database services (RDS, DocumentDB)
- [ ] Set up MSK for Kafka
- [ ] Implement custom Redis Cluster on EC2 instances
  - [ ] Create custom Redis AMI with optimized settings
  - [ ] Deploy EC2 instances in private subnets across AZs
  - [ ] Configure Redis Cluster with private IP communication
  - [ ] Set up monitoring and backup procedures

### Phase 2: CI/CD Pipeline
- [ ] Create ECR repositories for Docker images
- [ ] Set up CodePipeline or GitHub Actions
- [ ] Configure build and test stages
- [ ] Implement deployment automation
- [ ] Set up monitoring and alerting

### Phase 3: Initial Deployment
- [ ] Deploy services to staging environment
- [ ] Run integration tests
- [ ] Validate monitoring and logging
- [ ] Perform security assessment
- [ ] Deploy to production environment

### Phase 4: Optimization
- [ ] Implement auto-scaling
- [ ] Optimize resource allocation
- [ ] Set up cost monitoring
- [ ] Implement performance improvements
- [ ] Enhance security measures
