const ReportPortalClient = require("reportportal-js-client");

class RpService {
  async onPrepare(config, capabilities) {
    const reportPortalClientConfig = RpService.getRpReporterConfig(config);
    if (reportPortalClientConfig === null) {
      return;
    }
    const client = RpService.getReportPortalClient(reportPortalClientConfig);

    const {description, mode, tags } = reportPortalClientConfig;
    const {promise} = client.startLaunch({description, mode, tags});

    const {id} = await promise;
    process.env.RP_LAUNCH_ID = id;
    return promise;
  }

  async onComplete(exitCode, config) {
    const reportPortalClientConfig = RpService.getRpReporterConfig(config);
    if (reportPortalClientConfig === null) {
      return;
    }
    const client = RpService.getReportPortalClient(reportPortalClientConfig);
    const realLaunchId = process.env.RP_LAUNCH_ID;
    const {tempId} = client.startLaunch({id: realLaunchId});
    const {promise: finishLaunchPromise} = client.finishLaunch(tempId, {});
    return finishLaunchPromise;
  }

  static getRpReporterConfig(config) {
    const reporters = config.reporters.filter(([reporter]) => reporter.reporterName === "reportportal");
    if (reporters.length === 0) {
      return null;
    }
    const [, reporterConfig] = reporters[0];
    const {reportPortalClientConfig} = reporterConfig;
    return reportPortalClientConfig
  }

  static getReportPortalClient(reportPortalClientConfig) {
    return new ReportPortalClient(reportPortalClientConfig);
  }

}

module.exports = RpService;
