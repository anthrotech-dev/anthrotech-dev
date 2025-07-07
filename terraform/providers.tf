terraform {

  backend "s3" {
    bucket = "anthrotech"
    key   = "terraform/state/github-repos"
    region = "ap-northeast-1"
  }

  required_providers {
    github = {
      source  = "integrations/github"
      version = "~> 5.0"
    }
  }
}

provider "github" {
  owner = "anthrotech-dev"
}

