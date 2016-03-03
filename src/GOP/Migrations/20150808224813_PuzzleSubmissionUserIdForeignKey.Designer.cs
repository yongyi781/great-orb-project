using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using GOP.Models;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace GOP.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    partial class PuzzleSubmissionUserIdForeignKey
    {
        protected override void BuildTargetModel(ModelBuilder builder)
        {
            builder
                .HasAnnotation("ProductVersion", "7.0.0-beta7-13920")
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            builder.Entity("GOP.Models.ApplicationUser", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("AccessFailedCount");

                    b.Property<string>("ChatColor");

                    b.Property<string>("ConcurrencyStamp")
                        .IsConcurrencyToken();

                    b.Property<string>("Email")
                        .HasAnnotation("MaxLength", 256);

                    b.Property<bool>("EmailConfirmed");

                    b.Property<string>("GopControls");

                    b.Property<bool>("LockoutEnabled");

                    b.Property<DateTimeOffset?>("LockoutEnd");

                    b.Property<string>("NormalizedEmail")
                        .HasAnnotation("MaxLength", 256);

                    b.Property<string>("NormalizedUserName")
                        .HasAnnotation("MaxLength", 256);

                    b.Property<string>("PasswordHash");

                    b.Property<string>("PhoneNumber");

                    b.Property<bool>("PhoneNumberConfirmed");

                    b.Property<string>("SecurityStamp");

                    b.Property<bool>("TwoFactorEnabled");

                    b.Property<string>("UserName")
                        .HasAnnotation("MaxLength", 256);

                    b.HasKey("Id");

                    b.HasIndex("NormalizedEmail")
                        .HasAnnotation("Relational:Name", "EmailHasIndex");

                    b.HasIndex("NormalizedUserName")
                        .HasAnnotation("Relational:Name", "UserNameHasIndex");

                    b.HasAnnotation("Relational:TableName", "AspNetUsers");
                });

            builder.Entity("GOP.Models.ChatMessage", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("IpAddress")
                        .IsRequired()
                        .HasAnnotation("MaxLength", 50)
                        .HasAnnotation("Relational:ColumnType", "varchar(50)");

                    b.Property<string>("Text")
                        .IsRequired();

                    b.Property<DateTimeOffset>("Timestamp");

                    b.Property<int?>("UserId");

                    b.HasKey("Id");
                });

            builder.Entity("GOP.Models.CustomAltar", b =>
                {
                    b.Property<int>("Id");

                    b.Property<string>("GridJS")
                        .IsRequired();

                    b.Property<string>("Name")
                        .IsRequired();

                    b.Property<string>("SpawnsJS")
                        .IsRequired();

                    b.HasKey("Id");
                });

            builder.Entity("GOP.Models.MultiplayerGame", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("Altar");

                    b.Property<string>("Code")
                        .IsRequired();

                    b.Property<int>("NumberOfOrbs");

                    b.Property<int>("NumberOfPlayers");

                    b.Property<int>("Score");

                    b.Property<int>("Seed");

                    b.Property<DateTimeOffset>("Timestamp");

                    b.Property<string>("Usernames")
                        .IsRequired();

                    b.HasKey("Id");
                });

            builder.Entity("GOP.Models.Nickname", b =>
                {
                    b.Property<string>("IpAddress")
                        .HasAnnotation("MaxLength", 50)
                        .HasAnnotation("Relational:ColumnType", "varchar(50)");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasAnnotation("MaxLength", 50);

                    b.HasKey("IpAddress");
                });

            builder.Entity("GOP.Models.Puzzle", b =>
                {
                    b.Property<int>("Id");

                    b.Property<int>("Altar");

                    b.Property<int>("NumberOfOrbs");

                    b.Property<int>("NumberOfPlayers");

                    b.Property<string>("Orbs")
                        .IsRequired();

                    b.Property<string>("StartLocations")
                        .IsRequired();

                    b.HasKey("Id");
                });

            builder.Entity("GOP.Models.PuzzleSubmission", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Code")
                        .IsRequired();

                    b.Property<string>("IpAddress")
                        .IsRequired();

                    b.Property<int>("PuzzleId");

                    b.Property<int>("Score");

                    b.Property<DateTimeOffset>("Timestamp");

                    b.Property<int?>("UserId");

                    b.HasKey("Id");
                });

            builder.Entity("GOP.Models.SoloGame", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("Altar");

                    b.Property<string>("Code")
                        .IsRequired();

                    b.Property<string>("IpAddress")
                        .IsRequired();

                    b.Property<int>("NumberOfOrbs");

                    b.Property<int>("Score");

                    b.Property<int>("Seed");

                    b.Property<DateTimeOffset>("Timestamp");

                    b.Property<int?>("UserId");

                    b.HasKey("Id");
                });

            builder.Entity("Microsoft.AspNetCore.Identity.EntityFramework.IdentityRole<int>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("ConcurrencyStamp")
                        .IsConcurrencyToken();

                    b.Property<string>("Name")
                        .HasAnnotation("MaxLength", 256);

                    b.Property<string>("NormalizedName")
                        .HasAnnotation("MaxLength", 256);

                    b.HasKey("Id");

                    b.HasIndex("NormalizedName")
                        .HasAnnotation("Relational:Name", "RoleNameHasIndex");

                    b.HasAnnotation("Relational:TableName", "AspNetRoles");
                });

            builder.Entity("Microsoft.AspNetCore.Identity.EntityFramework.IdentityRoleClaim<int>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("ClaimType");

                    b.Property<string>("ClaimValue");

                    b.Property<int>("RoleId");

                    b.HasKey("Id");

                    b.HasAnnotation("Relational:TableName", "AspNetRoleClaims");
                });

            builder.Entity("Microsoft.AspNetCore.Identity.EntityFramework.IdentityUserClaim<int>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("ClaimType");

                    b.Property<string>("ClaimValue");

                    b.Property<int>("UserId");

                    b.HasKey("Id");

                    b.HasAnnotation("Relational:TableName", "AspNetUserClaims");
                });

            builder.Entity("Microsoft.AspNetCore.Identity.EntityFramework.IdentityUserLogin<int>", b =>
                {
                    b.Property<string>("LoginProvider");

                    b.Property<string>("ProviderKey");

                    b.Property<string>("ProviderDisplayName");

                    b.Property<int>("UserId");

                    b.HasKey("LoginProvider", "ProviderKey");

                    b.HasAnnotation("Relational:TableName", "AspNetUserLogins");
                });

            builder.Entity("Microsoft.AspNetCore.Identity.EntityFramework.IdentityUserRole<int>", b =>
                {
                    b.Property<int>("UserId");

                    b.Property<int>("RoleId");

                    b.HasKey("UserId", "RoleId");

                    b.HasAnnotation("Relational:TableName", "AspNetUserRoles");
                });

            builder.Entity("GOP.Models.ChatMessage", b =>
                {
                    b.HasOne("GOP.Models.ApplicationUser")
                        .WithMany()
                        .HasForeignKey("UserId");
                });

            builder.Entity("GOP.Models.PuzzleSubmission", b =>
                {
                    b.HasOne("GOP.Models.Puzzle")
                        .WithMany()
                        .HasForeignKey("PuzzleId");

                    b.HasOne("GOP.Models.ApplicationUser")
                        .WithMany()
                        .HasForeignKey("UserId");
                });

            builder.Entity("GOP.Models.SoloGame", b =>
                {
                    b.HasOne("GOP.Models.ApplicationUser")
                        .WithMany()
                        .HasForeignKey("UserId");
                });

            builder.Entity("Microsoft.AspNetCore.Identity.EntityFramework.IdentityRoleClaim<int>", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.EntityFramework.IdentityRole<int>")
                        .WithMany()
                        .HasForeignKey("RoleId");
                });

            builder.Entity("Microsoft.AspNetCore.Identity.EntityFramework.IdentityUserClaim<int>", b =>
                {
                    b.HasOne("GOP.Models.ApplicationUser")
                        .WithMany()
                        .HasForeignKey("UserId");
                });

            builder.Entity("Microsoft.AspNetCore.Identity.EntityFramework.IdentityUserLogin<int>", b =>
                {
                    b.HasOne("GOP.Models.ApplicationUser")
                        .WithMany()
                        .HasForeignKey("UserId");
                });

            builder.Entity("Microsoft.AspNetCore.Identity.EntityFramework.IdentityUserRole<int>", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.EntityFramework.IdentityRole<int>")
                        .WithMany()
                        .HasForeignKey("RoleId");

                    b.HasOne("GOP.Models.ApplicationUser")
                        .WithMany()
                        .HasForeignKey("UserId");
                });
        }
    }
}
