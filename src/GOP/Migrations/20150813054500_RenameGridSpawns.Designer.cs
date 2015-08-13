using System;
using Microsoft.Data.Entity;
using Microsoft.Data.Entity.Metadata;
using Microsoft.Data.Entity.Migrations.Infrastructure;
using GOP.Models;
using Microsoft.Data.Entity.SqlServer.Metadata;

namespace GOP.Migrations
{
    [ContextType(typeof(ApplicationDbContext))]
    partial class RenameGridSpawns
    {
        public override string Id
        {
            get { return "20150813054500_RenameGridSpawns"; }
        }

        public override string ProductVersion
        {
            get { return "7.0.0-beta7-13944"; }
        }

        public override void BuildTargetModel(ModelBuilder builder)
        {
            builder
                .Annotation("ProductVersion", "7.0.0-beta7-13944")
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
                        .Annotation("MaxLength", 50)
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

                    b.Property<string>("Grid")
                        .Required();

                    b.Property<string>("Name")
                        .Required();

                    b.Property<string>("Spawns")
                        .Required();

                    b.Key("Id");
                });

            builder.Entity("GOP.Models.DeadPracticeResult", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Data")
                        .Required();

                    b.Property<string>("IpAddress")
                        .Required();

                    b.Property<string>("Settings")
                        .Required();

                    b.Property<DateTimeOffset>("Timestamp");

                    b.Property<int?>("UserId");

                    b.Key("Id");
                });

            builder.Entity("GOP.Models.MultiplayerGame", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("Altar");

                    b.Property<string>("Code")
                        .Required();

                    b.Property<int>("NumberOfOrbs");

                    b.Property<int>("NumberOfPlayers");

                    b.Property<int>("Score");

                    b.Property<int>("Seed");

                    b.Property<DateTimeOffset>("Timestamp");

                    b.Property<string>("Usernames")
                        .Required();

                    b.Key("Id");
                });

            builder.Entity("GOP.Models.Nickname", b =>
                {
                    b.Property<string>("IpAddress")
                        .Annotation("MaxLength", 50)
                        .Annotation("Relational:ColumnType", "varchar(50)");

                    b.Property<DateTimeOffset>("LastChanged");

                    b.Property<string>("Name")
                        .Required()
                        .Annotation("MaxLength", 50);

                    b.Key("IpAddress");
                });

            builder.Entity("GOP.Models.Puzzle", b =>
                {
                    b.Property<int>("Id");

                    b.Property<int>("Altar");

                    b.Property<int>("NumberOfOrbs");

                    b.Property<int>("NumberOfPlayers");

                    b.Property<string>("Orbs")
                        .Required();

                    b.Property<string>("StartLocations")
                        .Required();

                    b.Key("Id");
                });

            builder.Entity("GOP.Models.PuzzleSubmission", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Code")
                        .Required();

                    b.Property<string>("IpAddress")
                        .Required();

                    b.Property<int>("PuzzleId");

                    b.Property<int>("Score");

                    b.Property<DateTimeOffset>("Timestamp");

                    b.Property<int?>("UserId");

                    b.Key("Id");
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

            builder.Entity("GOP.Models.DeadPracticeResult", b =>
                {
                    b.Reference("GOP.Models.ApplicationUser")
                        .InverseCollection()
                        .ForeignKey("UserId");
                });

            builder.Entity("GOP.Models.PuzzleSubmission", b =>
                {
                    b.Reference("GOP.Models.Puzzle")
                        .InverseCollection()
                        .ForeignKey("PuzzleId");

                    b.Reference("GOP.Models.ApplicationUser")
                        .InverseCollection()
                        .ForeignKey("UserId");
                });

            builder.Entity("GOP.Models.SoloGame", b =>
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
