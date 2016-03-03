using System;

namespace GOP
{
    /// <summary>
    /// Specifies that a controller action parameter, controller property, or model property should be bound using the request services during model binding.
    /// </summary>
    [AttributeUsage(AttributeTargets.Property | AttributeTargets.Parameter, AllowMultiple = false, Inherited = true)]
    public class FromServicesAttribute : Microsoft.AspNetCore.Mvc.FromServicesAttribute
    {
    }
}
