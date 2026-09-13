# How to Connect Forms to the C3 Command Center

The C3 Command Center supports three flexible methods to ingest applicant responses.

---

## ⚡ Method 1: Google Sheets / Excel Copy-Paste (Recommended - 0 Setup)

Whenever someone fills your Google Form, Google automatically records their answer in a linked Google Sheet. You can import dozens or hundreds of responses in seconds:

1. In your **Google Form**, go to the **Responses** tab and click **Link to Sheets** (the green spreadsheet icon).
2. Open the spreadsheet and select the applicant rows you want to import.
   - You can copy columns such as: *Timestamp, Name, Phone / WhatsApp, Email Address, Branch, Year, What do you want to build?, Why do you want to join?*
   - Press **`Ctrl + C`** to copy the selected rows.
3. Open the **C3 Command Center**:
   - Go to `http://localhost:4173/?admin=c3core` (or enter passcode `c3core`).
   - In the header, click **`[ <> Connect Form ]`**.
   - Scroll down to **Method 2: 1-Click Google Sheets / CSV Importer**.
   - Paste (`Ctrl + V`) directly into the text box.
   - Click **`[ 📥 Import Applicant Rows ]`**.
4. The Command Center will parse every applicant, validate their phone numbers, save their screening answers, and place them under **Pending Review** ready for your inspection!

---

## ⚡ Method 2: Live Automatic Webhook (Google Apps Script)

If you want responses from Google Forms to land in the Command Center in real time the moment a student hits "Submit":

1. In your **Google Form**, click the three vertical dots (`⋮`) in the top-right corner.
2. Select **`Extensions` > `Apps Script`**.
3. Clear out any existing code and paste the following snippet:

```javascript
function onFormSubmit(e) {
  // C3 Live Webhook: Connects Google Form to C3 Command Center
  var formResponse = e.response;
  var itemResponses = formResponse.getItemResponses();
  var payload = {
    source: "google_form",
    email: formResponse.getRespondentEmail() || ""
  };
  
  for (var i = 0; i < itemResponses.length; i++) {
    var title = itemResponses[i].getItem().getTitle();
    var answer = itemResponses[i].getResponse();
    
    if (title.indexOf("Name") !== -1) payload.name = answer;
    else if (title.indexOf("Phone") !== -1 || title.indexOf("WhatsApp") !== -1) payload.phone = answer;
    else if (title.indexOf("Branch") !== -1) payload.branch = answer;
    else if (title.indexOf("Year") !== -1) payload.year = answer;
    else if (title.indexOf("build") !== -1) payload.projectIdea = answer;
    else if (title.indexOf("Why") !== -1 || title.indexOf("motivation") !== -1) payload.motivation = answer;
    else payload[title] = answer;
  }
  
  // Replace with your live public URL (e.g. your ngrok tunnel, Render, Vercel, or custom domain)
  var webhookUrl = "http://localhost:4173/api/webhook/form";
  
  UrlFetchApp.fetch(webhookUrl, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
}
```

4. Click **`Save (Ctrl + S)`**.
5. In the left sidebar of Google Apps Script, click the **Triggers (clock icon)**.
6. Click **`+ Add Trigger`** at the bottom right:
   - Function to run: `onFormSubmit`
   - Deployment: `Head`
   - Event source: `From form`
   - Event type: `On form submit`
7. Click **`Save`** and grant permissions.
8. Now, whenever any applicant submits the Google Form, it automatically pings your server and creates an entry under **Pending Review**!

---

## ⚡ Method 3: Direct Website Application Modal

You can also send students directly to the website to apply:

1. Direct link: `https://<your-site>/?apply=true` (or students click the **[ Apply to Batch ]** button on the homepage).
2. They enter:
   - Full Name
   - Phone Number (WhatsApp)
   - Email Address
   - Branch & Year of Study
   - Track preference (Vibe Coder, AI Engineer, Hacker, etc.)
   - "What do you want to build at C3?"
   - "Why do you want to join the Founding Cohort?"
3. Upon clicking submit, they get celebratory sound and confetti, and their submission immediately appears in the Command Center!
