using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;
using System.Data.SqlClient;
using System.Configuration;
using System.IO;
using Newtonsoft.Json;
using System.Data.SQLite;
using Igprog;

/// <summary>
/// Scheduler
/// </summary>
[WebService(Namespace = "http://studiotanya.hr/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
[System.Web.Script.Services.ScriptService]
public class Scheduler : System.Web.Services.WebService {
    string dataBase = ConfigurationManager.AppSettings["dataBase"];
    Global G = new Global();
    DataBase db = new DataBase();
    public Scheduler() {
    }

    public class Event {
        public int? id;
        public int room;
        public string clientId;
        public string content;
        public long startDate;
        public long endDate;
        public string userId;
    }

    public class SchedulerData {
        public int total;
        public int appointments;
    }

    #region WebMethods
    [WebMethod]
    public string Init() {
        Event x = new Event();
        x.id = null;
        x.room = 0;
        x.clientId = null;
        x.content = null;
        x.startDate = Convert.ToInt64(DateTime.UtcNow.Ticks);
        x.endDate = Convert.ToInt64(DateTime.UtcNow.Ticks);
        x.userId = null;
        string json = JsonConvert.SerializeObject(x, Formatting.None);
        return json;
    }

    [WebMethod]
    public string Load(string userGroupId, string userId) {
        db.CreateDataBase(userGroupId, db.scheduler);
        List<Event> xx = new List<Event>();
        try {
            using (SQLiteConnection connection = new SQLiteConnection("Data Source=" + db.GetDataBasePath(dataBase))) {
                connection.Open();
                string sql = "SELECT rowid, room, clientId, content, startDate, endDate, userId FROM scheduler";
                using (SQLiteCommand command = new SQLiteCommand(sql, connection)) {
                    using (SQLiteDataReader reader = command.ExecuteReader()) {
                        xx = new List<Event>();
                        while (reader.Read()) {
                            Event x = new Event();
                            x.id = reader.GetValue(0) == DBNull.Value ? 0 : reader.GetInt32(0);
                            x.room = reader.GetValue(1) == DBNull.Value ? 0 : reader.GetInt32(1);
                            x.clientId = reader.GetValue(2) == DBNull.Value ? "" : reader.GetString(2);
                            x.content = reader.GetValue(3) == DBNull.Value ? "" : reader.GetString(3);
                            x.startDate = reader.GetValue(4) == DBNull.Value ? 0 : reader.GetInt64(4);
                            x.endDate = reader.GetValue(5) == DBNull.Value ? 0 : reader.GetInt64(5);
                            x.userId = reader.GetValue(6) == DBNull.Value ? "" : reader.GetString(6);
                            xx.Add(x);
                        }
                    }
                }  
                connection.Close();
            }
            return JsonConvert.SerializeObject(xx, Formatting.None);
        } catch (Exception e) { return e.Message; }
    }

    [WebMethod]
    public string Save(string userGroupId, string userId, Event x) {
        db.CreateDataBase(userGroupId, db.scheduler);
        try {
            using (SQLiteConnection connection = new SQLiteConnection("Data Source=" + db.GetDataBasePath(dataBase))) {
                connection.Open();
                string sql = @"INSERT OR REPLACE INTO scheduler (room, clientId, content, startDate, endDate, userId)
                        VALUES (@room, @clientId, @content, @startDate, @endDate, @userId)";
                using (SQLiteCommand command = new SQLiteCommand(sql, connection)) {
                    command.Parameters.Add(new SQLiteParameter("id", x.id));
                    command.Parameters.Add(new SQLiteParameter("clientId", x.clientId));
                    command.Parameters.Add(new SQLiteParameter("room", x.room));
                    command.Parameters.Add(new SQLiteParameter("content", x.content));
                    command.Parameters.Add(new SQLiteParameter("startDate", x.startDate));
                    command.Parameters.Add(new SQLiteParameter("endDate", x.endDate));
                    command.Parameters.Add(new SQLiteParameter("userId", x.userId));
                    command.ExecuteNonQuery();
                }
                connection.Close();
            }
            return ("saved");
        } catch (Exception e) { return e.Message; }
    }

    [WebMethod]
    public string Delete(string userGroupId, string userId, Event x) {
        db.CreateDataBase(userGroupId, db.scheduler);
        try {
            SQLiteConnection connection = new SQLiteConnection("Data Source=" + db.GetDataBasePath(dataBase));
            connection.Open();
            string sql = string.Format(@"DELETE FROM scheduler WHERE content = '{0}' AND startDate = '{1}' AND room = '{2}' AND userId = '{3}'", x.content, x.startDate, x.room, x.userId);
            SQLiteCommand command = new SQLiteCommand(sql, connection);
            command.ExecuteNonQuery();
            connection.Close();
            return ("deleted");
        } catch (Exception e) { return e.Message; }
    }

    [WebMethod]
    public string GetSchedulerEvents(int room, string uid) {
        try {
            db.CreateDataBase(null, db.scheduler);
            List<Event> xx = new List<Event>();
            using (SQLiteConnection connection = new SQLiteConnection("Data Source=" + db.GetDataBasePath(dataBase))) {
                connection.Open();
                string sql = string.Format(@"
                            SELECT rowid, room, clientId, content, startDate, endDate, userId FROM scheduler WHERE room = {0}"
                               , room);
                using (SQLiteCommand command = new SQLiteCommand(sql, connection)) {
                    using (SQLiteDataReader reader = command.ExecuteReader()) {
                        xx = new List<Event>();
                        while (reader.Read()) {
                            Event x = new Event();
                            x.id = reader.GetValue(0) == DBNull.Value ? 0 : reader.GetInt32(0);
                            x.room = reader.GetValue(1) == DBNull.Value ? 0 : reader.GetInt32(1);
                            x.clientId = reader.GetValue(2) == DBNull.Value ? null : reader.GetString(2);
                            x.content = reader.GetValue(3) == DBNull.Value ? null : reader.GetString(3);
                            x.startDate = reader.GetValue(4) == DBNull.Value ? 0 : reader.GetInt64(4);
                            x.endDate = reader.GetValue(5) == DBNull.Value ? 0 : reader.GetInt64(5);
                            x.userId = reader.GetValue(6) == DBNull.Value ? null : reader.GetString(6);
                            xx.Add(x);
                        }
                    }
                }
                connection.Close();
            }
            return JsonConvert.SerializeObject(xx, Formatting.None);
        } catch (Exception e) { return e.Message; }
    }

    [WebMethod]
    public string GetAppointmentsCountByUserId(string userGroupId, string userId) {
        try {
            db.CreateDataBase(userGroupId, db.scheduler);
            SQLiteConnection connection = new SQLiteConnection("Data Source=" + db.GetDataBasePath(dataBase));
            connection.Open();
            string sql = "";
            SQLiteCommand command = null;
            SQLiteDataReader reader = null;
            SchedulerData x = new SchedulerData();
            sql = "SELECT COUNT(rowid) FROM scheduler";
            command = new SQLiteCommand(sql, connection);
            reader = command.ExecuteReader();
            while (reader.Read()) {
                x.total = reader.GetValue(0) == DBNull.Value ? 0 : reader.GetInt32(0);
            }
            sql = string.Format("SELECT COUNT(rowid) FROM scheduler where cast((startDate/1000) AS INT) > CAST(strftime('%s', 'now') AS INT) AND userId = '{0}'", userId);
            command = new SQLiteCommand(sql, connection);
            reader = command.ExecuteReader();
            while (reader.Read()) {
                x.appointments = reader.GetValue(0) == DBNull.Value ? 0 : reader.GetInt32(0);
            }
            connection.Close();
            return JsonConvert.SerializeObject(x, Formatting.None);
        } catch (Exception e) { return e.Message; }
    }

    [WebMethod]
    public string RemoveAllEvents(string userGroupId) {
        db.CreateDataBase(userGroupId, db.scheduler);
        try {
            string sql = "DELETE FROM scheduler";
            using (SQLiteConnection connection = new SQLiteConnection("Data Source=" + db.GetDataBasePath(dataBase))) {
                connection.Open();
                using (SQLiteCommand command = new SQLiteCommand(sql, connection)) {
                    command.ExecuteNonQuery();
                }
                connection.Close();
            }
            return ("deleted");
        } catch (Exception e) { return e.Message; }
    }
    #endregion WebMethods

}
