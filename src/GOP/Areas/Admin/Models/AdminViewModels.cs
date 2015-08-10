using GOP.Models;
using System;

namespace GOP.Areas.Admin.Models
{
    public class PuzzleSubmissionAdminView
    {
        public PuzzleSubmission Submission { get; set; }
        public string Username { get; set; }
        public int Par { get; set; }
    }

    public class ChatInfoView
    {
        public string ConnectionID { get; set; }
        public DateTimeOffset ConnectionTime { get; set; }
        public int? UserId { get; set; }
        public string IpAddress { get; set; }
        public string Username { get; set; }
    }
}
