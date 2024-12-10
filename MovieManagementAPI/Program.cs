using Microsoft.EntityFrameworkCore;
using MovieManagementAPI.Data;
using Microsoft.AspNetCore.Identity;
using MovieManagementAPI.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using Amazon.SecretsManager;
using Amazon.Extensions.NETCore.Setup;
using Amazon.SecretsManager.Model;

var builder = WebApplication.CreateBuilder(args);

// Load configuration based on environment
builder.Configuration
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables();

if (builder.Environment.IsDevelopment())
{
    builder.Configuration.AddUserSecrets<Program>();
}

//C:\Users\khanl\Desktop\AngularMovie_Project\movie-management-app\dist\movie-management-app\browser
//C:\Users\khanl\Downloads\movieappkeypair.pem
//ec2-52-53-164-74.us-west-1.compute.amazonaws.com


// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddLogging();
builder.Services.AddAWSService<IAmazonSecretsManager>();
builder.Services.AddSingleton<AwsSecretsManagerHelper>();

if (builder.Environment.IsDevelopment())
{
    // Fake email sender for development
    builder.Services.AddTransient<IAppEmailSender, FakeEmailSender>();
}
else
{
    // Real email sender for production
    builder.Services.AddTransient<IAppEmailSender, EmailSender>();
}

// JWT Authentication setup
builder.Services.AddAuthentication(opt =>
{
    opt.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    opt.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(opt =>
{
    opt.TokenValidationParameters = new TokenValidationParameters
    {
        RequireExpirationTime = true,
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
        ValidAudience = builder.Configuration["JwtSettings:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:SecurityKey"]!)),
        NameClaimType = JwtRegisteredClaimNames.Name,
    };
});

builder.Services.AddAuthorization();

builder.Services.AddDbContext<MovieContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.SignIn.RequireConfirmedAccount = true;
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequiredLength = 8;
})
.AddEntityFrameworkStores<MovieContext>()
.AddDefaultTokenProviders();

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      policy =>
                      {
                          policy.WithOrigins(
                              "http://localhost:4200",
                              "http://ec2-52-53-164-74.us-west-1.compute.amazonaws.com"
                          )
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                      });
});

builder.Services.AddSignalR();
builder.Services.AddScoped<JwtHandler>();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    try
    {
        var secretsHelper = app.Services.GetRequiredService<AwsSecretsManagerHelper>();

        var dbSecret = secretsHelper.GetSecretAsync<Dictionary<string, string>>("MovieManagementAPI/Database").Result;
        var dbConnectionString = $"Data Source={dbSecret["host"]};" +
                                 $"Initial Catalog={dbSecret["dbname"]};" +
                                 $"User ID={dbSecret["username"]};" +
                                 $"Password={dbSecret["password"]};" +
                                 "MultipleActiveResultSets=True; Encrypt=True;TrustServerCertificate=True;";
        app.Configuration["ConnectionStrings:DefaultConnection"] = dbConnectionString;

        var emailSecret = secretsHelper.GetSecretAsync<Dictionary<string, string>>("MovieManagementAPI/EmailSender").Result;
        app.Configuration["EmailSender:Host"] = emailSecret["EmailSender:Host"];
        app.Configuration["EmailSender:Port"] = emailSecret["EmailSender:Port"];
        app.Configuration["EmailSender:Username"] = emailSecret["EmailSender:Username"];
        app.Configuration["EmailSender:Password"] = emailSecret["EmailSender:Password"];
        app.Configuration["EmailSender:FromEmail"] = emailSecret["EmailSender:FromEmail"];

        var jwtSecret = secretsHelper.GetSecretAsync<Dictionary<string, string>>("MovieManagementAPI/JWTSettings").Result;
        app.Configuration["JwtSettings:SecurityKey"] = jwtSecret["JwtSettings:SecurityKey"];
        app.Configuration["JwtSettings:Issuer"] = jwtSecret["JwtSettings:Issuer"];
        app.Configuration["JwtSettings:Audience"] = jwtSecret["JwtSettings:Audience"];
        app.Configuration["JwtSettings:ExpirationTimeInMinutes"] = jwtSecret["JwtSettings:ExpirationTimeInMinutes"];

        var defaultPasswords = secretsHelper.GetSecretAsync<Dictionary<string, string>>("MovieManagementAPI/DefaultPasswords").Result;
        app.Configuration["DefaultPasswords:Administrator"] = defaultPasswords["DefaultPasswords:Administrator"];
        app.Configuration["DefaultPasswords:RegisteredUser"] = defaultPasswords["DefaultPasswords:RegisteredUser"];

    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error loading secrets: {ex.Message}");
        throw;
    }
}


app.UseCors(MyAllowSpecificOrigins);
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<ChatHub>("/api/chathub");

app.Run();
