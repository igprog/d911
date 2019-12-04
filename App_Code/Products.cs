using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;
using System.Web.Script;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using Newtonsoft.Json;
using System.Runtime.Serialization;
using System.IO;
using System.Data.SQLite;
using Igprog;

/// <summary>
/// Products
/// </summary>
[WebService(Namespace = "http://dizajn911.com/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
[System.Web.Script.Services.ScriptService]
public class Products : System.Web.Services.WebService {
    Global G = new Global();
    DataBase DB = new DataBase();

    public Products () {
    }

    public class NewProduct {
        public string id;
        public string productGroup;
        public string title;
        public string shortDesc;
        public string longDesc;
        public string img;
        public bool isActive;
        public int displayType;
        public string[] gallery;
    }

    public class City {
        public string city;
    }

    [WebMethod]
    public string Init() {
        try {
            NewProduct x = new NewProduct();
            x.id = null;
            x.productGroup = null;
            x.title = null;
            x.shortDesc = null;
            x.longDesc = null;
            x.img = null;
            x.isActive = true;
            x.displayType = 0;
            return JsonConvert.SerializeObject(x, Formatting.Indented);    
        } catch (Exception e) {
            return e.Message;
        }
    }

    [WebMethod]
    public string Load() {
        try {
            return JsonConvert.SerializeObject(LoadData(), Formatting.None);
        } catch (Exception e) {
            return JsonConvert.SerializeObject(e.Message, Formatting.None);
        }
    }

    public List<NewProduct> LoadData() {
        DB.CreateDataBase(G.products);
        string sql = "SELECT id, productGroup, title, shortDesc, longDesc, img, isActive, displayType FROM products";
        List<NewProduct> xx = new List<NewProduct>();
        using (var connection = new SQLiteConnection("Data Source=" + DB.GetDataBasePath(G.dataBase))) {
            connection.Open();
            using (var command = new SQLiteCommand(sql, connection)) {
                using (var reader = command.ExecuteReader()) {
                    xx = new List<NewProduct>();
                    while (reader.Read()) {
                        NewProduct x = new NewProduct();
                        x.id = G.ReadS(reader, 0);
                        x.productGroup = G.ReadS(reader, 1);
                        x.title = G.ReadS(reader, 2);
                        x.shortDesc = G.ReadS(reader, 3);
                        x.longDesc = G.ReadS(reader, 4);
                        x.img = G.ReadS(reader, 5);
                        x.isActive = G.ReadB(reader, 6);
                        x.displayType = G.ReadI(reader, 7);
                        x.gallery = GetGallery(x.id);
                        xx.Add(x);
                    }
                }
            }
            connection.Close();
        }
        return xx;
    }

    [WebMethod]
    public string Get(string id) {
        try {
            return JsonConvert.SerializeObject(GetProduct(id), Formatting.None);
        } catch(Exception e) {
            return JsonConvert.SerializeObject(e.Message, Formatting.None);
        }
    }

    public NewProduct GetProduct(string id) {
        NewProduct x = new NewProduct();
        string sql = string.Format("SELECT id, productGroup, title, shortDesc, longDesc, img, isActive, displayType FROM products WHERE id = '{0}'", id);
        using (var connection = new SQLiteConnection("Data Source=" + DB.GetDataBasePath(G.dataBase))) {
            connection.Open();
            using (var command = new SQLiteCommand(sql, connection)) {
                var reader = command.ExecuteReader();
                x = new NewProduct();
                while (reader.Read()) {
                    x.id = G.ReadS(reader, 0);
                    x.productGroup = G.ReadS(reader, 1);
                    x.title = G.ReadS(reader, 2);
                    x.shortDesc = G.ReadS(reader, 3);
                    x.longDesc = G.ReadS(reader, 4);
                    x.img = G.ReadS(reader, 5);
                    x.isActive = G.ReadB(reader, 6);
                    x.displayType = G.ReadI(reader, 7);
                    x.gallery = GetGallery(x.id);
                }
            }
            connection.Close();
        }
        return x;
    }

    [WebMethod]
    public string Save(NewProduct x) {
        try {
            DB.CreateDataBase(G.products);
            string sql = null;
            if (string.IsNullOrEmpty(x.id)) {
                x.id = Guid.NewGuid().ToString();
                sql = string.Format(@"INSERT INTO products VALUES('{0}', '{1}', '{2}', '{3}', '{4}', '{5}', '{6}', '{7}')"
                                    , x.id, x.productGroup, x.title, x.shortDesc, x.longDesc, x.img, x.isActive, x.displayType);
            } else {
                sql = string.Format(@"UPDATE products SET productGroup = '{1}', title = '{2}', shortDesc = '{3}', longDesc = '{4}', img = '{5}', isActive = '{6}', displayType = '{7}'  WHERE id = '{0}'"
                                    , x.id, x.productGroup, x.title, x.shortDesc, x.longDesc, x.img, x.isActive, x.displayType);
            }
            using (var connection = new SQLiteConnection("Data Source=" + DB.GetDataBasePath(G.dataBase))) {
                connection.Open();
                using (var command = new SQLiteCommand(sql, connection)) {
                    command.ExecuteNonQuery();
                }
                connection.Close();
            }
            return JsonConvert.SerializeObject(LoadData(), Formatting.None);
        } catch (Exception e) {
            return JsonConvert.SerializeObject(e.Message, Formatting.None);
        }
    }

    [WebMethod]
    public string Delete(NewProduct x) {
        try {
            string sql = string.Format("DELETE FROM products WHERE id = '{0}'", x.id);
            using (var connection = new SQLiteConnection("Data Source=" + DB.GetDataBasePath(G.dataBase))) {
                connection.Open();
                using (var command = new SQLiteCommand(sql, connection)) {
                    command.ExecuteNonQuery();
                }
                connection.Close();
            }
            return JsonConvert.SerializeObject(LoadData(), Formatting.None);
        } catch (Exception e) {
            return JsonConvert.SerializeObject(e.Message, Formatting.None);
        }
    }

    [WebMethod]
    public string DeleteImg(string productId, string img) {
        try {
            string path = Server.MapPath(string.Format("~/upload/{0}/gallery", productId));
            if (Directory.Exists(path)) {
                string[] gallery = Directory.GetFiles(path);
                foreach (string file in gallery) {
                    if (Path.GetFileName(file) == img) {
                        File.Delete(file);
                        RemoveMainImg(productId, img);
                    }
                }
            }
            return JsonConvert.SerializeObject(LoadData(), Formatting.None);
        } catch (Exception e) {
            return JsonConvert.SerializeObject(e.Message, Formatting.None);
        }
    }

    public void RemoveMainImg(string productId, string img) {
        string sql = string.Format("UPDATE products SET img = ''  WHERE id = '{0}' AND img = '{1}'", productId, img);
        using (var connection = new SQLiteConnection("Data Source=" + DB.GetDataBasePath(G.dataBase))) {
            connection.Open();
            using (var command = new SQLiteCommand(sql, connection)) {
                command.ExecuteNonQuery();
            }
            connection.Close();
        }
    }

    [WebMethod]
    public string LoadProductGallery(string productId) {
        try {
            string[] x = GetGallery(productId);
            return JsonConvert.SerializeObject(x, Formatting.None);
        } catch(Exception e) {
            return null;
        }
    }

    [WebMethod]
    public string SetMainImg(string productId, string img) {
        try {
            string sql = string.Format("UPDATE products SET img = '{0}' WHERE id = '{1}'" ,img , productId);
            using (var connection = new SQLiteConnection("Data Source=" + DB.GetDataBasePath(G.dataBase))) {
                connection.Open();
                using (var command = new SQLiteCommand(sql, connection)) {
                    command.ExecuteNonQuery();
                }
                connection.Close();
            }
            return JsonConvert.SerializeObject(LoadData(), Formatting.None);
        } catch (Exception e) {
            return JsonConvert.SerializeObject(e.Message, Formatting.None);
        }
    }

    string[] GetGallery(string id) {
        string[] xx = null;
        string path = Server.MapPath(string.Format("~/upload/{0}/gallery", id));
        if (Directory.Exists(path)) {
            string[] ss = Directory.GetFiles(path);
            xx = ss.Select(a => Path.GetFileName(a)).ToArray();
        }
        return xx;
    }

}
