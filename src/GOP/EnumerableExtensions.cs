using System;
using System.Collections.Generic;

namespace GOP
{
    public static class EnumerableExtensions
    {
        public static double? StdDev<T>(this IEnumerable<T> values, Func<T, double?> selector)
        {
            double mean = 0.0;
            double sum = 0.0;
            double stdDev = 0.0;
            int n = 0;
            foreach (T item in values)
            {
                var val = selector(item);
                if (val == null)
                    continue;
                n++;
                double delta = val.Value - mean;
                mean += delta / n;
                sum += delta * (val.Value - mean);
            }
            if (n == 0)
                return null;
            if (n > 1)
                stdDev = Math.Sqrt(sum / (n - 1));

            return stdDev;
        }
    }
}
