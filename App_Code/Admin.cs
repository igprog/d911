using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;
using Igprog;

/// <summary>
/// Admin
/// </summary>
[WebService(Namespace = "http://dizajn911.com/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
[System.Web.Script.Services.ScriptService]
public class Admin : System.Web.Services.WebService {
    Global G = new Global();
    public Admin() {
    }

    [WebMethod]
    public bool Login(string username, string password) {
        if (username == G.adminUserName && password == G.adminPassword) {
            return true;
        } else {
            return false;
        }
    }

}
