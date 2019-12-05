using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;
using System.IO;
using Newtonsoft.Json;
using Igprog;

/// <summary>
/// Info
/// </summary>
[WebService(Namespace = "http://dizajn911.com/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
[System.Web.Script.Services.ScriptService]
public class Info : System.Web.Services.WebService {
    string path = "~/data/info.json";
    string folder = "~/data/";

    public Info() {
    }

    public class NewInfo {
        public string company;
        public string address;
        public string pin;
        public string firstName;
        public string lastName;
        public string phone;
        public string email;
        public string services;
        public string about;
    }

    [WebMethod]
    public string Load() {
        try {
            return JsonConvert.SerializeObject(GetInfo(), Formatting.None);
        } catch (Exception e) {
            return JsonConvert.SerializeObject(e.Message, Formatting.None);
        }
    }

    [WebMethod]
    public string Save(NewInfo x) {
        try {
            if (!Directory.Exists(Server.MapPath(folder))) {
                Directory.CreateDirectory(Server.MapPath(folder));
            }
            WriteFile(path, x);
            return Load();
        } catch (Exception e) { return ("Error: " + e); }
    }

    [WebMethod]
    public string LoadMainGellery() {
        try {
            string[] x = GetMainGallery();
            return JsonConvert.SerializeObject(x, Formatting.None);
        } catch (Exception e) {
            return null;
        }
    }

    [WebMethod]
    public string DeleteMainImg(string img) {
        try {
            string path = Server.MapPath(string.Format("~/upload/main/{1}", folder, img));
            if (File.Exists(path)) {
                File.Delete(path);
            }
            return JsonConvert.SerializeObject(null, Formatting.None);
        } catch (Exception e) {
            return JsonConvert.SerializeObject(img, Formatting.None);
        }
    }

    protected void WriteFile(string path, NewInfo value) {
        File.WriteAllText(Server.MapPath(path), JsonConvert.SerializeObject(value));
    }

    public NewInfo GetInfo() {
        NewInfo x = new NewInfo();
        string json = ReadFile();
        if (!string.IsNullOrEmpty(json)) {
            return JsonConvert.DeserializeObject<NewInfo>(json);
        } else {
            return x;
        }
    }

    public string ReadFile() {
        if (File.Exists(Server.MapPath(path))) {
            return File.ReadAllText(Server.MapPath(path));
        } else {
            return null;
        }
    }

    string[] GetMainGallery() {
        string[] xx = null;
        string path = Server.MapPath("~/upload/main");
        if (Directory.Exists(path)) {
            string[] ss = Directory.GetFiles(path);
            xx = ss.Select(a => Path.GetFileName(a)).ToArray();
        }
        return xx;
    }

}
