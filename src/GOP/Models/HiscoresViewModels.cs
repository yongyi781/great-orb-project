using System.Collections.Generic;
using System.Linq;

namespace GOP.Models
{
    public enum HiscoresGameType { Solo, Duo, Trio, Quad }

    public class SeedAltarScoreEntry
    {
        public int Seed { get; set; }
        public int Altar { get; set; }
        public int Score { get; set; }
    }

    public class HiscoresRow
    {
        public int Seed { get; set; }
        public int?[] Scores { get; set; }
        public int? Sum =>
            Scores.Aggregate((int?)0, (acc, curr) => curr == null ? null : acc + curr);
    }

    public class HiscoresAggregateRow<T> where T : struct
    {
        public T?[] ScoreValues { get; set; }
        public T? SumValue { get; set; }
    }

    public class HiscoresViewModel
    {
        public IEnumerable<HiscoresRow> Rows { get; set; }
        public HiscoresAggregateRow<int> Counts { get; set; }
        public HiscoresAggregateRow<int> Mins { get; set; }
        public HiscoresAggregateRow<int> Maxes { get; set; }
        public HiscoresAggregateRow<double> Averages { get; set; }
        public HiscoresAggregateRow<double> StandardDeviations { get; set; }
        public int? MinTotalIndex { get; set; }
        public int? MaxTotalIndex { get; set; }
    }
}
