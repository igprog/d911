<%@ WebHandler Language="C#" Class="UploadHandler" %>

using System;
using System.Web;
using System.IO;

using System.Linq;
using System.Configuration;

public class UploadHandler : IHttpHandler {

    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "text/plain";
        string imgId = context.Request.Form["imgId"];
        if (context.Request.Files.Count > 0) {
            HttpFileCollection files = context.Request.Files;
            for (int i = 0; i < files.Count; i++) {
                HttpPostedFile file = files[i];
                string fname = context.Server.MapPath(string.Format("~/upload/{0}/gallery/{1}", imgId, file.FileName));
                if (!string.IsNullOrEmpty(file.FileName)) {
                    string folderPath = context.Server.MapPath(string.Format("~/upload/{0}/gallery", imgId));
                    if (!Directory.Exists(folderPath)) {
                        Directory.CreateDirectory(folderPath);
                    }
                    if (CheckGalleryLimit(folderPath)) {
                        file.SaveAs(fname);
                        context.Response.Write(imgId);
                    } else {
                        context.Response.Write("product limit exceeded");  //TODO
                    }
                } else {
                    context.Response.Write("please choose a file to upload");
                }
            }
        }
    }

    public bool IsReusable {
        get {
            return false;
        }
    }

    private bool CheckGalleryLimit(string path) {
        int count = 0;
        int productsLimit = Convert.ToInt32(ConfigurationManager.AppSettings["galleryLimit"]);
        if (Directory.Exists(path)) {
            string[] ss = Directory.GetFiles(path);
            count = ss.Count();
        }
        return count <= productsLimit ? true : false;
    }

}