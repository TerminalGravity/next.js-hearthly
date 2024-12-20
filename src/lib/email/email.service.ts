import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Skipping email send.");
    return;
  }

  try {
    await resend.emails.send({
      from: "Family Gather <notifications@familygather.app>",
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

export function generateRsvpNotificationEmail(eventTitle: string, userName: string, status: string) {
  return {
    subject: `New RSVP for ${eventTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New RSVP Update</h2>
        <p>${userName} has responded "${status}" to the event "${eventTitle}".</p>
        <p>Log in to view all responses and event details.</p>
      </div>
    `,
  };
}

export function generateCommentNotificationEmail(eventTitle: string, userName: string, comment: string) {
  return {
    subject: `New Comment on ${eventTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Comment</h2>
        <p>${userName} commented on the event "${eventTitle}":</p>
        <blockquote style="border-left: 4px solid #e5e7eb; margin: 1.5em 0; padding-left: 1em;">
          ${comment}
        </blockquote>
        <p>Log in to view all comments and respond.</p>
      </div>
    `,
  };
}

export function generateEventUpdateEmail(eventTitle: string, changes: string[]) {
  return {
    subject: `Event Update: ${eventTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Event Update</h2>
        <p>The event "${eventTitle}" has been updated:</p>
        <ul style="margin: 1.5em 0;">
          ${changes.map(change => `<li>${change}</li>`).join("")}
        </ul>
        <p>Log in to view the complete event details.</p>
      </div>
    `,
  };
}

export function generateEventDeletedEmail(eventTitle: string, eventDate: Date) {
  return {
    subject: `Event Cancelled: ${eventTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Event Cancelled</h2>
        <p>The event "${eventTitle}" scheduled for ${eventDate.toLocaleDateString()} has been cancelled.</p>
        <p>Contact the event organizer for more information.</p>
      </div>
    `,
  };
} 