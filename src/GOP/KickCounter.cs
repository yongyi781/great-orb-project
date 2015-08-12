using System.Threading;

public class KickCounter
{
	private int count;

	public int Kick()
	{
		return Interlocked.Increment(ref count);
	}
}