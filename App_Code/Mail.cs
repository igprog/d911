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
            r.msg = "Poslano";
            return r;
        } catch (Exception e) {
            Response r = new Response();
            r.isSent = false;
            r.msg = e.Message;
            return r;
        }
    }

}