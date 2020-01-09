using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using Newtonsoft.Json;
using System.Runtime.Serialization;
using System.Data.SQLite;
using Igprog;

/// <summary>
/// ProductGroups
/// </summary>
[WebService(Namespace = "http://dizajn911.com/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
[System.Web.Script.Services.ScriptService]
[DataContract(IsReference = true)]
public class ProductGroups : System.Web.Services.WebService {
    Global G = new Global();
    DataBase DB = new DataBase();
    public ProductGroups () {
    }

    public class NewProductGroup {
        public string id;
        public string title;
    }

    [WebMethod]
    public string Init() {
        try {
            NewProductGroup x = new NewProductGroup();
            x.id = null;
            x.title = null;
            return JsonConvert.SerializeObject(x, Formatting.Indented);
        } catch (Exception e) {
            return JsonConvert.SerializeObject(e.Message, Formatting.Indented);
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

    public List<NewProductGroup> LoadData() {
        DB.CreateDataBase(G.db.productGroups);
        string sql = "SELECT id, title FROM ProductGroups";
        List<NewProductGroup> xx = new List<NewProductGroup>();
        using (var connection = new SQLiteConnection("Data Source=" + DB.GetDataBasePath(G.dataBase))) {
            connection.Open();
            using (var command = new SQLiteCommand(sql, connection)) {
                using (var reader = command.ExecuteReader()) {
                    xx = new List<NewProductGroup>();
                    while (reader.Read()) {
                        NewProductGroup x = new NewProductGroup();
                        x.id = G.ReadS(reader, 0);
                        x.title = G.ReadS(reader, 1);
                        xx.Add(x);
                    }
                }
            }
            connection.Close();
        }
        return xx;
    }

    [WebMethod]
    public string GetProductGroupByProductGroupId(string productGroupId) {
        SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["connectionString"].ConnectionString);
        connection.Open();
        SqlCommand command = new SqlCommand("SELECT ProductGroupId, Title FROM ProductGroups WHERE ProductGroupId = ProductGroupId ", connection);
        command.Parameters.Add(new SqlParameter("ProductId", productGroupId));
        SqlDataReader reader = command.ExecuteReader();
        List<NewProductGroup> products = new List<NewProductGroup>();
        while (reader.Read()) {
            if (productGroupId == reader.GetGuid(0).ToString()) {
                NewProductGroup xx = new NewProductGroup() {
                    id = reader.GetString(0),
                    title = reader.GetString(1),
                };
                products.Add(xx);
            }
        }
        connection.Close();
        return JsonConvert.SerializeObject(products, Formatting.Indented);
    }

    [WebMethod]
    public string Save(NewProductGroup x) {
        try {
            DB.CreateDataBase(G.db.productGroups);
            string sql = null;
            if (string.IsNullOrEmpty(x.id)) {
                x.id = Guid.NewGuid().ToString();
                sql = string.Format(@"INSERT INTO ProductGroups VALUES ('{0}', '{1}')", x.id, x.title);
            } else {
                sql = string.Format(@"UPDATE ProductGroups SET title = '{1}' WHERE id = '{0}'", x.id, x.title);
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
    public string Delete(NewProductGroup x) {
        try {
            string sql = string.Format(" DELETE FROM ProductGroups WHERE id = '{0}'", x.id);
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


    
}
