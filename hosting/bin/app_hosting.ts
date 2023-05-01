#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { AppHostingStack } from '../lib/app_hosting-stack'

const app = new cdk.App()
new AppHostingStack(app, 'AppHostingStack', {})
