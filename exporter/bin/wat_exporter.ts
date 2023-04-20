#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { WatExporterStack } from '../lib/wat_exporter-stack'

const app = new cdk.App()
new WatExporterStack(app, 'WatExporterStack', {})
