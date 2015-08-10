using GOP.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace GOP.Tests
{
    public class HiscoresTest
    {
        [Fact]
        public void HiscoresRowNoNullsSumsCorrectly()
        {
            var hiscoresRow = new HiscoresRow
            {
                Seed = 0,
                Scores = new int?[] { 40, 15, 28, 13, 37, 34 }
            };

            Assert.Equal(167, hiscoresRow.Sum);
        }

        [Fact]
        public void HiscoresRowWithNullsSumsCorrectly()
        {
            var hiscoresRow = new HiscoresRow
            {
                Seed = 0,
                Scores = new int?[] { 40, 15, 28, 13, 37, null }
            };

            Assert.Equal(null, hiscoresRow.Sum);
        }
    }
}
