import { Link, useSearchParams } from "react-router-dom";
import { AssistMeEmbedded } from "./AssistMeWorkspace.jsx";

const MODULES = [
  { tag: "idt-booking-appointment-list-form", product: "BookingDepositDesk", trade: "Coding · FE", title: "Build the appointment calendar list and book form" },
  { tag: "idt-booking-appointments-api", product: "BookingDepositDesk", trade: "Coding · BE", title: "Implement appointments API with slot conflict checks" },
  { tag: "idt-booking-deposit-list-form", product: "BookingDepositDesk", trade: "Coding · FE", title: "Build deposit list and take-deposit form" },
  { tag: "idt-booking-deposits-api", product: "BookingDepositDesk", trade: "Coding · BE", title: "Implement deposits API with held/applied status" },
  { tag: "idt-booking-day-board-filter", product: "BookingDepositDesk", trade: "Coding · FE", title: "Build day board filtered by provider" },
  { tag: "idt-invoice-list-form", product: "InvoiceFollowUpTracker", trade: "Coding · FE", title: "Build invoice list and create-invoice form" },
  { tag: "idt-invoice-overdue-api", product: "InvoiceFollowUpTracker", trade: "Coding · BE", title: "Implement invoices API with overdue status" },
  { tag: "idt-invoice-reminder-list-form", product: "InvoiceFollowUpTracker", trade: "Coding · FE", title: "Build reminder log list and schedule form" },
  { tag: "idt-invoice-reminder-api", product: "InvoiceFollowUpTracker", trade: "Coding · BE", title: "Implement reminders API — one pending per invoice channel" },
  { tag: "idt-invoice-overdue-board", product: "InvoiceFollowUpTracker", trade: "Coding · FE", title: "Build overdue board filtered by status" },
  { tag: "idt-lead-list-form", product: "LeadFollowUpInbox", trade: "Coding · FE", title: "Build lead inbox list and capture form" },
  { tag: "idt-lead-stale-api", product: "LeadFollowUpInbox", trade: "Coding · BE", title: "Implement leads API with fresh/stale status" },
  { tag: "idt-lead-reply-list-form", product: "LeadFollowUpInbox", trade: "Coding · FE", title: "Build reply notes list and add-note form" },
  { tag: "idt-lead-notes-api", product: "LeadFollowUpInbox", trade: "Coding · BE", title: "Implement lead-notes API blocking duplicate body spam" },
  { tag: "idt-lead-stale-board", product: "LeadFollowUpInbox", trade: "Coding · FE", title: "Build stale-lead board filtered by status" },
  { tag: "idt-shift-list-form", product: "ShiftCoverageBoard", trade: "Coding · FE", title: "Build shift board list and publish form" },
  { tag: "idt-shift-overlap-api", product: "ShiftCoverageBoard", trade: "Coding · BE", title: "Implement shifts API with worker overlap conflicts" },
  { tag: "idt-coverage-list-form", product: "ShiftCoverageBoard", trade: "Coding · FE", title: "Build open coverage list and request form" },
  { tag: "idt-coverage-api", product: "ShiftCoverageBoard", trade: "Coding · BE", title: "Implement coverage API with open/filled status" },
  { tag: "idt-open-shift-board", product: "ShiftCoverageBoard", trade: "Coding · FE", title: "Build open-shift board filtered to unfilled coverage" },
  { tag: "idt-quote-list-form", product: "QuoteEstimateDesk", trade: "Coding · FE", title: "Build quote list and create-estimate form" },
  { tag: "idt-quote-expiry-api", product: "QuoteEstimateDesk", trade: "Coding · BE", title: "Implement quotes API with open/expired/accepted status" },
  { tag: "idt-quote-line-list-form", product: "QuoteEstimateDesk", trade: "Coding · FE", title: "Build quote line-items list and add-line form" },
  { tag: "idt-quote-lines-api", product: "QuoteEstimateDesk", trade: "Coding · BE", title: "Implement quote-lines API blocking duplicate labels" },
  { tag: "idt-quote-accepted-board", product: "QuoteEstimateDesk", trade: "Coding · FE", title: "Build accepted-quotes board filtered by status" },
  { tag: "idt-review-list-form", product: "ReviewReplyInbox", trade: "Coding · FE", title: "Build review inbox list and log-review form" },
  { tag: "idt-review-needs-reply-api", product: "ReviewReplyInbox", trade: "Coding · BE", title: "Implement reviews API with needs-reply status" },
  { tag: "idt-review-reply-list-form", product: "ReviewReplyInbox", trade: "Coding · FE", title: "Build review replies list and write-reply form" },
  { tag: "idt-review-replies-api", product: "ReviewReplyInbox", trade: "Coding · BE", title: "Implement review-replies API — one reply per channel" },
  { tag: "idt-review-unanswered-board", product: "ReviewReplyInbox", trade: "Coding · FE", title: "Build unanswered-reviews board filtered by status" },
  { tag: "idt-reminder-schedule-list-form", product: "ClientReminderHub", trade: "Coding · FE", title: "Build reminder schedule list and create form" },
  { tag: "idt-reminder-due-api", product: "ClientReminderHub", trade: "Coding · BE", title: "Implement reminders API with due/sent status" },
  { tag: "idt-reminder-template-list-form", product: "ClientReminderHub", trade: "Coding · FE", title: "Build reminder templates list and save-template form" },
  { tag: "idt-reminder-templates-api", product: "ClientReminderHub", trade: "Coding · BE", title: "Implement reminder-templates API — unique name per channel" },
  { tag: "idt-reminder-due-board", product: "ClientReminderHub", trade: "Coding · FE", title: "Build due-reminders board filtered by status" },
  { tag: "idt-package-list-form", product: "PackagePunchCard", trade: "Coding · FE", title: "Build package punch-card list and sell form" },
  { tag: "idt-package-remaining-api", product: "PackagePunchCard", trade: "Coding · BE", title: "Implement packages API with remaining/empty status" },
  { tag: "idt-punch-log-list-form", product: "PackagePunchCard", trade: "Coding · FE", title: "Build punch log list and redeem form" },
  { tag: "idt-punch-redeem-api", product: "PackagePunchCard", trade: "Coding · BE", title: "Implement punches API rejecting redeem when empty" },
  { tag: "idt-package-low-board", product: "PackagePunchCard", trade: "Coding · FE", title: "Build low-balance packages board filtered by status" },
];

export default function AssistPreview() {
  const [params, setParams] = useSearchParams();
  const tag = params.get("module");
  const current = MODULES.find((m) => m.tag === tag);

  if (current) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
        <div style={{ padding: "10px 16px", borderBottom: "1px solid #e2e8f0", display: "flex", gap: 12, alignItems: "center" }}>
          <button type="button" onClick={() => setParams({})}>
            ← All {MODULES.length} Coding modules
          </button>
          <span>
            {current.product} · {current.trade}
          </span>
        </div>
        <AssistMeEmbedded moduleTag={current.tag} mode="here" embedded />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px", fontFamily: "Segoe UI, system-ui, sans-serif" }}>
      <h1 style={{ color: "#c41e3a", fontSize: 22 }}>Assist preview — {MODULES.length} Coding modules</h1>
      <p style={{ color: "#64748b" }}>
        Same INPACT lesson UI (Lesson → Objectives → Step N). Objectives are transferable skills;
        Why this matters is developer rationale; UI lessons include a tryable DESIGN MOCK. Products
        justified in docs/SMB_PRODUCT_SELECTION_JOURNAL.md.
      </p>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {MODULES.map((m) => (
          <li key={m.tag} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 14, margin: "10px 0" }}>
            <div style={{ fontSize: 12, color: "#c41e3a", fontWeight: 700 }}>
              {m.product} · {m.trade}
            </div>
            <div style={{ fontWeight: 600, margin: "4px 0 10px" }}>{m.title}</div>
            <Link to={`/assist-preview?module=${m.tag}`}>Open Assist Me →</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
