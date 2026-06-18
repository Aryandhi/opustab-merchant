const fs = require('fs');

function formatDuration(ms) {
    if(!ms || ms < 0) return '0s';
    const totalSeconds = ms / 1000;
    if (totalSeconds < 60) {
        return `${totalSeconds.toFixed(1)}s`;
    }
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = (totalSeconds % 60).toFixed(0);
    return `${minutes}m ${seconds}s`;
}

function getGithubContext() {
    const {
        LARK_WEBHOOK_URL,
        GITHUB_REPOSITORY,
        GITHUB_RUN_ID,
        GITHUB_REF_NAME,
        GITHUB_SHA,
        JOB_STATUS,
        TEST_REPORT_PATH,
    } = process.env;
    if (!LARK_WEBHOOK_URL) {
        console.error('LARK_WEBHOOK_URL is not set. Please set it in your GitHub Actions secrets.');
        process.exit(0);
    }
    const repo = GITHUB_REPOSITORY || 'unknown-repo';
    const commitSha = (GITHUB_SHA || '000000000').substring(0, 7);
    return {
        webhookUrl: LARK_WEBHOOK_URL,
        jobStatus: JOB_STATUS || 'unknown',
        repo,
        runId: GITHUB_RUN_ID || '0',
        refName: GITHUB_REF_NAME || 'unknown',
        commitSha,
        runUrl: `https://github.com/${repo}/actions/runs/${GITHUB_RUN_ID || '0'}`,
        commitUrl: `https://github.com/${repo}/commit/${GITHUB_SHA || '000000000'}`,
        repoPath: TEST_REPORT_PATH || 'test-results.json',
    }
}

function parseTestReport(reportPath) {
    try {
        if (fs.existsSync(reportPath)) {
            const reportData = fs.readFileSync(reportPath, 'utf-8');
            const report = JSON.parse(reportData);

            if (report.stats) {
                const stats = report.stats;
                const passed = stats.passed || 0;
                const failed = stats.unexpected || 0;
                const flaky = stats.flaky || 0;
                const skipped = stats.skipped || 0;

                const totalRun = passed + failed + flaky + skipped;
                const totalConsidered = passed + failed + flaky;
                const successRate = totalConsidered === 0 ? 100 : ((passed + flaky) / totalConsidered * 100);

                return {
                    passed,
                    failed,
                    flaky,
                    skipped,
                    totalRun,
                    duration: formatDuration(stats.duration),
                    successRate: successRate.toFixed(1) + '%',
                }
                
            }
        }
        console.log(`Report file not found at: ${reportPath}`);
        return null;
    } catch (error) {
        console.error(`Error reading or parsing report file at: ${reportPath}`, error);
        return null;
    }
}

function buildLarkPayload(context, reportStats) {
    const statusIcon = context.jobStatus === 'success' ? '✅' : '❌';
    const statusColor = context.jobStatus === 'success' ? 'green' : 'red';
    
    let statsText = '';
    if (reportStats) {
        statsText = `• Total: ${reportStats.totalRun}\n• ✅ Passed: ${reportStats.passed}\n• ❌ Failed: ${reportStats.failed}\n• 🔶 Flaky: ${reportStats.flaky}\n• ⏭️ Skipped: ${reportStats.skipped}\n• Success Rate: ${reportStats.successRate}\n• Duration: ${reportStats.duration}`;
    } else {
        statsText = '• Test report file not found';
    }

    return {
        msg_type: 'interactive',
        card: {
            config: {
                wide_screen_mode: true
            },
            elements: [
                {
                    tag: 'div',
                    text: {
                        content: `${statusIcon} **Test Report: ${context.jobStatus.toUpperCase()}**\n**Repository:** ${context.repo}\n**Branch:** ${context.refName}\n**Commit:** ${context.commitSha}`,
                        tag: 'lark_md'
                    }
                },
                {
                    tag: 'hr'
                },
                {
                    tag: 'div',
                    text: {
                        content: `**Test Statistics:**\n${statsText}`,
                        tag: 'lark_md'
                    }
                },
                {
                    tag: 'action',
                    actions: [
                        {
                            tag: 'button',
                            text: {
                                content: 'View Test Report',
                                tag: 'lark_md'
                            },
                            url: context.runUrl,
                            type: 'primary'
                        },
                        {
                            tag: 'button',
                            text: {
                                content: 'View Commit',
                                tag: 'lark_md'
                            },
                            url: context.commitUrl,
                            type: 'default'
                        }
                    ]
                }
            ],
            header: {
                title: {
                    content: 'Opustab-Merchant Test Report',
                    tag: 'plain_text'
                },
                template: statusColor
            }
        }
    };
}

async function sendLarkNotification() {
    const context = getGithubContext();
    const reportStats = parseTestReport(context.repoPath);
    const payload = buildLarkPayload(context, reportStats);

    try {
        const response = await fetch(context.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Lark API responded with ${response.status}: ${await response.text()}`);
        }
        console.log('Successfully sent Lark notification');
    } catch (error) {
        console.error('Error sending Lark notification:', error.message);
    }
}

sendLarkNotification();
