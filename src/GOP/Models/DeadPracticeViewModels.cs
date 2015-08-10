using Newtonsoft.Json.Linq;
using System;

namespace GOP.Models
{
    public class DeadPracticeResultViewModel
    {
        public int Id { get; set; }
        public DateTimeOffset Timestamp { get; set; }
        public string Username { get; set; }
        public dynamic Settings { get; set; }
        public JArray Data { get; set; }

        public double MinTime { get; set; }
        public double MedianTime { get; set; }
        public double AverageTime { get; set; }
        public double MisclickRate { get; set; }
    }
}
