using System;
using System.Net;
using System.Net.Mail;
using Igprog;

/// <summary>
/// Mail
/// </summary>
public class Mail {
    Global G = new Global();
    public Mail() {
    }

    public class Response {
        public bool isSent;
        public string msg;
        public string msg1;
    }

    public Response SendMail(string sendTo, string subject, string body) {
        try {
            MailMessage mail = new MailMessage();
            mail.From = new MailAddress(G.myEmail, G.myEmailName);
            mail.To.Add(sendTo);
            mail.Subject = subject;
            mail.Body = body;
            mail.IsBodyHtml = true;
            SmtpClient smtp = new SmtpClient(G.myServerHost, G.myServerPort);
            NetworkCredential Credentials = new NetworkCredential(G.myEmail, G.myPassword);
            smtp.Credentials = Credentials;
            smtp.Send(mail);
            Response r = new Response();
            r.isSent = true;
            r.msg = "message successfully sent";
            r.msg1 = "we will reply to you as soon as possible";
            return r;
        } catch (Exception e) {
            Response r = new Response();
            r.isSent = false;
            r.msg = e.Message;
            r.msg1 = e.StackTrace;
            return r;
        }
    }

}