using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using GOP.Models;

namespace GOP.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20160814063204_RemoveGopControls")]
    partial class RemoveGopControls
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
            modelBuilder
                .HasAnnotation("ProductVersion", "1.1.0-alpha1-21858")
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("GOP.Models.ApplicationUser", b =>
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
                        .HasName("EmailIndex");

                    b.HasIndex("NormalizedUserName")
                        .IsUnique()
                        .HasName("UserNameIndex");

                    b.ToTable("AspNetUsers");
                });

            modelBuilder.Entity("GOP.Models.ChatMessage", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("IpAddress")
                        .IsRequired()
                        .HasColumnType("varchar(50)");

                    b.Property<string>("Text")
                        .IsRequired();

                    b.Property<DateTimeOffset>("Timestamp");

                    b.Property<int?>("UserId");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("ChatMessages");
                });

            modelBuilder.Entity("GOP.Models.DeadPracticeResult", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Data")
                        .IsRequired();

                    b.Property<string>("IpAddress")
                        .IsRequired()
                        .HasColumnType("varchar(50)");

                    b.Property<string>("Settings")
                        .IsRequired();

                    b.Property<DateTimeOffset>("Timestamp");

                    b.Property<int?>("UserId");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("DeadPracticeResults");
                });

            modelBuilder.Entity("GOP.Models.GopAltar", b =>
                {
                    b.Property<int>("Id");

                    b.Property<string>("Grid")
                        .IsRequired();

                    b.Property<string>("GroundColor");

                    b.Property<string>("GroundPattern");

                    b.Property<string>("Name")
                        .IsRequired();

                    b.Property<string>("Spawns")
                        .IsRequired();

                    b.Property<string>("WaterColor");

                    b.HasKey("Id");

                    b.ToTable("GopAltars");
                });

            modelBuilder.Entity("GOP.Models.MultiplayerGame", b =>
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

                    b.HasIndex("Altar");

                    b.ToTable("MultiplayerGames");
                });

            modelBuilder.Entity("GOP.Models.Nickname", b =>
                {
                    b.Property<string>("IpAddress")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("varchar(50)");

                    b.Property<DateTimeOffset>("LastChanged");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasAnnotation("MaxLength", 50);

                    b.HasKey("IpAddress");

                    b.ToTable("Nicknames");
                });

            modelBuilder.Entity("GOP.Models.Puzzle", b =>
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

                    b.HasIndex("Altar");

                    b.ToTable("Puzzles");
                });

            modelBuilder.Entity("GOP.Models.PuzzleSubmission", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Code")
                        .IsRequired();

                    b.Property<string>("IpAddress")
                        .IsRequired()
                        .HasColumnType("varchar(50)");

                    b.Property<int>("PuzzleId");

                    b.Property<int>("Score");

                    b.Property<DateTimeOffset>("Timestamp");

                    b.Property<int?>("UserId");

                    b.HasKey("Id");

                    b.HasIndex("PuzzleId");

                    b.HasIndex("UserId");

                    b.ToTable("PuzzleSubmissions");
                });

            modelBuilder.Entity("GOP.Models.SoloGame", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("Altar");

                    b.Property<string>("Code")
                        .IsRequired();

                    b.Property<string>("IpAddress")
                        .IsRequired()
                        .HasColumnType("varchar(50)");

                    b.Property<int>("NumberOfOrbs");

                    b.Property<int>("Score");

                    b.Property<int>("Seed");

                    b.Property<DateTimeOffset>("Timestamp");

                    b.Property<int?>("UserId");

                    b.HasKey("Id");

                    b.HasIndex("Altar");

                    b.HasIndex("UserId");

                    b.ToTable("SoloGames");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityRole<int>", b =>
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
                        .HasName("RoleNameIndex");

                    b.ToTable("AspNetRoles");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityRoleClaim<int>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("ClaimType");

                    b.Property<string>("ClaimValue");

                    b.Property<int>("RoleId");

                    b.HasKey("Id");

                    b.HasIndex("RoleId");

                    b.ToTable("AspNetRoleClaims");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityUserClaim<int>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("ClaimType");

                    b.Property<string>("ClaimValue");

                    b.Property<int>("UserId");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("AspNetUserClaims");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityUserLogin<int>", b =>
                {
                    b.Property<string>("LoginProvider");

                    b.Property<string>("ProviderKey");

                    b.Property<string>("ProviderDisplayName");

                    b.Property<int>("UserId");

                    b.HasKey("LoginProvider", "ProviderKey");

                    b.HasIndex("UserId");

                    b.ToTable("AspNetUserLogins");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityUserRole<int>", b =>
                {
                    b.Property<int>("UserId");

                    b.Property<int>("RoleId");

                    b.HasKey("UserId", "RoleId");

                    b.HasIndex("RoleId");

                    b.ToTable("AspNetUserRoles");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityUserToken<int>", b =>
                {
                    b.Property<int>("UserId");

                    b.Property<string>("LoginProvider");

                    b.Property<string>("Name");

                    b.Property<string>("Value");

                    b.HasKey("UserId", "LoginProvider", "Name");

                    b.ToTable("AspNetUserTokens");
                });

            modelBuilder.Entity("GOP.Models.ChatMessage", b =>
                {
                    b.HasOne("GOP.Models.ApplicationUser", "User")
                        .WithMany()
                        .HasForeignKey("UserId");
                });

            modelBuilder.Entity("GOP.Models.DeadPracticeResult", b =>
                {
                    b.HasOne("GOP.Models.ApplicationUser", "User")
                        .WithMany()
                        .HasForeignKey("UserId");
                });

            modelBuilder.Entity("GOP.Models.MultiplayerGame", b =>
                {
                    b.HasOne("GOP.Models.GopAltar", "GopAltar")
                        .WithMany()
                        .HasForeignKey("Altar")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("GOP.Models.Puzzle", b =>
                {
                    b.HasOne("GOP.Models.GopAltar", "GopAltar")
                        .WithMany()
                        .HasForeignKey("Altar")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("GOP.Models.PuzzleSubmission", b =>
                {
                    b.HasOne("GOP.Models.Puzzle", "Puzzle")
                        .WithMany("PuzzleSubmissions")
                        .HasForeignKey("PuzzleId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("GOP.Models.ApplicationUser", "User")
                        .WithMany()
                        .HasForeignKey("UserId");
                });

            modelBuilder.Entity("GOP.Models.SoloGame", b =>
                {
                    b.HasOne("GOP.Models.GopAltar", "GopAltar")
                        .WithMany()
                        .HasForeignKey("Altar")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("GOP.Models.ApplicationUser", "User")
                        .WithMany()
                        .HasForeignKey("UserId");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityRoleClaim<int>", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityRole<int>")
                        .WithMany("Claims")
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityUserClaim<int>", b =>
                {
                    b.HasOne("GOP.Models.ApplicationUser")
                        .WithMany("Claims")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityUserLogin<int>", b =>
                {
                    b.HasOne("GOP.Models.ApplicationUser")
                        .WithMany("Logins")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityUserRole<int>", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityRole<int>")
                        .WithMany("Users")
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("GOP.Models.ApplicationUser")
                        .WithMany("Roles")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade);
                });
        }
    }
}
