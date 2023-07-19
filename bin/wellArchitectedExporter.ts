#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { WellArchitectedExporterStack } from '../lib/wellArchitectedExporterStack'
import * as appConfig from '../deployment-config.json'

const app = new cdk.App()
new WellArchitectedExporterStack(app, 'WellArchitectedExporterStack', appConfig)
