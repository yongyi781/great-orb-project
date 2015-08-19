using System;
using Microsoft.Data.Entity;
using Microsoft.Data.Entity.Metadata;
using GOP.Models;
using Microsoft.Data.Entity.SqlServer.Metadata;
using Microsoft.Data.Entity.Infrastructure;

namespace GOP.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    partial class AddSoloGame
    {
        public override string Id
        {
            get { return "20150806033308_AddSoloGame"; }
        }
        
        protected override void BuildTargetModel(ModelBuilder builder)
        {
            builder
                .Annotation("ProductVersion", "7.0.0-beta7-13877")
                .Annotation("SqlServer:ValueGenerationStrategy", SqlServerIdentityStrategy.IdentityColumn);

            builder.Entity("GOP.Models.ApplicationUser", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("AccessFailedCount");

                    b.Property<string>("ChatColor");

                    b.Property<string>("ConcurrencyStamp")
                        .ConcurrencyToken();

                    b.Property<string>("Email")
                        .Annotation("MaxLength", 256);

                    b.Property<bool>("EmailConfirmed");

                    b.Property<string>("GopControls");

                    b.Property<bool>("LockoutEnabled");

                    b.Property<DateTimeOffset?>("LockoutEnd");

                    b.Property<string>("NormalizedEmail")
                        .Annotation("MaxLength", 256);

                    b.Property<string>("NormalizedUserName")
                        .Annotation("MaxLength", 256);

                    b.Property<string>("PasswordHash");

                    b.Property<string>("PhoneNumber");

                    b.Property<bool>("PhoneNumberConfirmed");

                    b.Property<string>("SecurityStamp");

                    b.Property<bool>("TwoFactorEnabled");

                    b.Property<string>("UserName")
                        .Annotation("MaxLength", 256);

                    b.Key("Id");

                    b.Index("NormalizedEmail")
                        .Annotation("Relational:Name", "EmailIndex");

                    b.Index("NormalizedUserName")
                        .Annotation("Relational:Name", "UserNameIndex");

                    b.Annotation("Relational:TableName", "AspNetUsers");
                });

            builder.Entity("GOP.Models.ChatMessage", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("IpAddress")
                        .Required()
                        .Annotation("Relational:ColumnType", "varchar(50)");

                    b.Property<string>("Text")
                        .Required();

                    b.Property<DateTimeOffset>("Timestamp");

                    b.Property<int?>("UserId");

                    b.Key("Id");
                });

            builder.Entity("GOP.Models.CustomAltar", b =>
                {
                    b.Property<int>("Id");

                    b.Property<string>("GridJS")
                        .Required();

                    b.Property<string>("Name")
                        .Required();

                    b.Property<string>("SpawnsJS")
                        .Required();

                    b.Key("Id");
                });

            builder.Entity("GOP.Models.Nickname", b =>
                {
                    b.Property<string>("IpAddress")
                        .Annotation("Relational:ColumnType", "varchar(50)");

                    b.Property<string>("Name")
                        .Required()
                        .Annotation("MaxLength", 50);

                    b.Key("IpAddress");
                });

            builder.Entity("GOP.Models.SoloGame", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("Altar");

                    b.Property<string>("Code")
                        .Required();

                    b.Property<string>("IpAddress")
                        .Required();

                    b.Property<int>("NumberOfOrbs");

                    b.Property<int>("Score");

                    b.Property<int>("Seed");

                    b.Property<DateTimeOffset>("Timestamp");

                    b.Property<int?>("UserId");

                    b.Key("Id");
                });

            builder.Entity("Microsoft.AspNet.Identity.EntityFramework.IdentityRole<int>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("ConcurrencyStamp")
                        .ConcurrencyToken();

                    b.Property<string>("Name")
                        .Annotation("MaxLength", 256);

                    b.Property<string>("NormalizedName")
                        .Annotation("MaxLength", 256);

                    b.Key("Id");

                    b.Index("NormalizedName")
                        .Annotation("Relational:Name", "RoleNameIndex");

                    b.Annotation("Relational:TableName", "AspNetRoles");
                });

            builder.Entity("Microsoft.AspNet.Identity.EntityFramework.IdentityRoleClaim<int>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("ClaimType");

                    b.Property<string>("ClaimValue");

                    b.Property<int>("RoleId");

                    b.Key("Id");

                    b.Annotation("Relational:TableName", "AspNetRoleClaims");
                });

            builder.Entity("Microsoft.AspNet.Identity.EntityFramework.IdentityUserClaim<int>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("ClaimType");

                    b.Property<string>("ClaimValue");

                    b.Property<int>("UserId");

                    b.Key("Id");

                    b.Annotation("Relational:TableName", "AspNetUserClaims");
                });

            builder.Entity("Microsoft.AspNet.Identity.EntityFramework.IdentityUserLogin<int>", b =>
                {
                    b.Property<string>("LoginProvider");

                    b.Property<string>("ProviderKey");

                    b.Property<string>("ProviderDisplayName");

                    b.Property<int>("UserId");

                    b.Key("LoginProvider", "ProviderKey");

                    b.Annotation("Relational:TableName", "AspNetUserLogins");
                });

            builder.Entity("Microsoft.AspNet.Identity.EntityFramework.IdentityUserRole<int>", b =>
                {
                    b.Property<int>("UserId");

                    b.Property<int>("RoleId");

                    b.Key("UserId", "RoleId");

                    b.Annotation("Relational:TableName", "AspNetUserRoles");
                });

            builder.Entity("GOP.Models.ChatMessage", b =>
                {
                    b.Reference("GOP.Models.ApplicationUser")
                        .InverseCollection()
                        .ForeignKey("UserId");
                });

            builder.Entity("Microsoft.AspNet.Identity.EntityFramework.IdentityRoleClaim<int>", b =>
                {
                    b.Reference("Microsoft.AspNet.Identity.EntityFramework.IdentityRole<int>")
                        .InverseCollection()
                        .ForeignKey("RoleId");
                });

            builder.Entity("Microsoft.AspNet.Identity.EntityFramework.IdentityUserClaim<int>", b =>
                {
                    b.Reference("GOP.Models.ApplicationUser")
                        .InverseCollection()
                        .ForeignKey("UserId");
                });

            builder.Entity("Microsoft.AspNet.Identity.EntityFramework.IdentityUserLogin<int>", b =>
                {
                    b.Reference("GOP.Models.ApplicationUser")
                        .InverseCollection()
                        .ForeignKey("UserId");
                });

            builder.Entity("Microsoft.AspNet.Identity.EntityFramework.IdentityUserRole<int>", b =>
                {
                    b.Reference("Microsoft.AspNet.Identity.EntityFramework.IdentityRole<int>")
                        .InverseCollection()
                        .ForeignKey("RoleId");

                    b.Reference("GOP.Models.ApplicationUser")
                        .InverseCollection()
                        .ForeignKey("UserId");
                });
        }
    }
}
