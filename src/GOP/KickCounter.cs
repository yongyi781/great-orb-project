using System.Threading;

namespace GOP
{
    public class KickCounter
    {
        private int count;

        public int Kick()
        {
            return Interlocked.Increment(ref count);
        }
    }
}
