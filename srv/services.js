const cds = require('@sap/cds')

class ProcessorService extends cds.ApplicationService {
  /** Registering custom event handlers */
  init() {
    this.before("UPDATE", "Incidents", (req) => this.onUpdate(req));
    this.before("CREATE", "Incidents", (req) => this.changeUrgencyDueToSubject(req.data));

    return super.init();
  }

  changeUrgencyDueToSubject(data) {
    if (data) {
      const incidents = Array.isArray(data) ? data : [data];
      incidents.forEach((incident) => {
        if (incident.title?.toLowerCase().includes("urgent")) {
          incident.urgency = { code: "H", descr: "High" };
        }
      });
    }
  }

  /** Custom Validation */
  async onUpdate (req) {
    const { status_code } = await SELECT.one(req.subject, i => i.status_code).where({ID: req.data.ID})
    if (status_code === 'C')
      return req.reject(`Can't modify a closed incident`)
  }
}
module.exports = { ProcessorService }


// Email service 
const SapCfMailer = require("sap-cf-mailer").default;

module.exports = cds.service.impl(function () {
    this.on('sendMail', async () => {
        try {
            const transporter = new SapCfMailer("GmailSMTP"); // Match your destination
            const result = await transporter.sendMail({
                to: "raakesh@graduate.utm.my", //to list separated by comma
                cc: "", //cc list separated by comma
                subject: "Test Mail from BTP System",
                html: "Hello from CAP!",
                attachments: []
            });
            return `Email sent successfully`;
        } catch (error) {
            console.error('Error sending email:', error);
            return `Error sending email: ${error.message}`;
        }
    });
});
