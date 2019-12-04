using System;
using System.Collections.Generic;
using System.Web.Services;
using Newtonsoft.Json;
using System.Data.SQLite;
using Igprog;

/// <summary>
/// Reservation
/// </summary>
[WebService(Namespace = "http://studiotanya.hr/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
[System.Web.Script.Services.ScriptService]
public class Reservation : System.Web.Services.WebService {
    Global G = new Global();
    DataBase db = new DataBase();
    public Reservation() {
    }

    public class NewReservation {
        public int id;
        public string service;
        public string date;
        public string time;
        public string name;
        public string phone;
        public string email;
        public bool confirmed;
        public bool accept;
        public Mail.Response response;
    }

    [WebMethod]
    public string Init() {
        NewReservation x = new NewReservation();
        x.id = 0;
        x.service = null;
        x.date = null;
        x.time = null;
        x.name = null;
        x.phone = null;
        x.email = null;
        x.confirmed = false;
        x.accept = false;
        x.response = new Mail.Response();
        x.response.isSent = false;
        x.response.msg = null;
        return JsonConvert.SerializeObject(x, Formatting.None);
    }

    [WebMethod]
    public string Load() {
        db.CreateDataBase(null, db.reservation);
        List<NewReservation> xx = new List<NewReservation>();
        try {
            return JsonConvert.SerializeObject(LoadData(), Formatting.None);
        } catch (Exception e) { return e.Message; }
    }

    public List<NewReservation> LoadData() {
        db.CreateDataBase(null, db.reservation);
        List<NewReservation> xx = new List<NewReservation>();
        using (SQLiteConnection connection = new SQLiteConnection("Data Source=" + db.GetDataBasePath(G.dataBase))) {
            connection.Open();
            string sql = "SELECT rowid, service, serviceDate, serviceTime, name, phone, email, confirmed FROM reservation ORDER BY rowid DESC";
            using (SQLiteCommand command = new SQLiteCommand(sql, connection)) {
                using (SQLiteDataReader reader = command.ExecuteReader()) {
                    xx = new List<NewReservation>();
                    while (reader.Read()) {
                        NewReservation x = new NewReservation();
                        x.id = G.ReadI(reader, 0);
                        x.service = G.ReadS(reader, 1);
                        x.date = G.ReadS(reader, 2);
                        x.time = G.ReadS(reader, 3);
                        x.name = G.ReadS(reader, 4);
                        x.phone = G.ReadS(reader, 5);
                        x.email = G.ReadS(reader, 6);
                        x.confirmed = G.ReadB(reader, 7);
                        xx.Add(x);
                    }
                }
            }
            connection.Close();
        }
        return xx;
    }

    [WebMethod]
    public string Send(NewReservation x) {
        try {
            string subject = string.Format(@"
<p>Usluga: {0}</p>
<p>Datum: {1}</p>
<p>Vrijeme: {2}</p>
<p>Ime: {3}</p>
<p>Telefon: <a href=""tel:{4}"" style=""color:#ff6b6b"">&#9742; {4}</a></p>
<p>E-mail: <a href=""mailto:{5}?Subject=Studio Tanya"" style=""color:#ff6b6b"">&#9993; {5}</a></p>", x.service, x.date, x.time, x.name, x.phone, x.email);
        Mail m = new Mail();
        x.response = m.SendMail(G.email, "Novi upit", subject);
        Save(x);
        return JsonConvert.SerializeObject(x, Formatting.None);
        } catch (Exception e) {
            return JsonConvert.SerializeObject(new NewReservation(), Formatting.None);
        }
    }

    private void Save(NewReservation x) {
        db.CreateDataBase(null, db.reservation);
        using (SQLiteConnection connection = new SQLiteConnection("Data Source=" + db.GetDataBasePath(G.dataBase))) {
            connection.Open();
            string sql = string.Format(@"INSERT OR REPLACE INTO reservation (service, serviceDate, serviceTime, name, phone, email, confirmed)
                        VALUES ('{0}', '{1}', '{2}', '{3}', '{4}', '{5}', '{6}')"
                    , x.service, x.date, x.time, x.name, x.phone, x.email, x.confirmed);
            using (SQLiteCommand command = new SQLiteCommand(sql, connection)) {
                command.ExecuteNonQuery();
            }
            connection.Close();
        }
    }


    [WebMethod]
    public string UpdateInquery(NewReservation x) {
        try {
            using (SQLiteConnection connection = new SQLiteConnection("Data Source=" + db.GetDataBasePath(G.dataBase))) {
                connection.Open();
                string sql = string.Format(@"UPDATE reservation SET confirmed = '{1}' WHERE rowid = {0}"
                        , x.id, x.confirmed);
                using (SQLiteCommand command = new SQLiteCommand(sql, connection)) {
                    command.ExecuteNonQuery();
                }
                connection.Close();
            }
            return JsonConvert.SerializeObject(LoadData(), Formatting.None);
        } catch (Exception e) { return e.Message; }
    }




}
