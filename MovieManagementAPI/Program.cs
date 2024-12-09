using Microsoft.EntityFrameworkCore;
using MovieManagementAPI.Data;
using Microsoft.AspNetCore.Identity;
using MovieManagementAPI.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddTransient<IAppEmailSender, EmailSender>();
builder.Services.AddLogging(); 

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
    // SignalR-specific token handling
    opt.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            Console.WriteLine($"Path: {path}, Token: {accessToken}");

            if (!string.IsNullOrEmpty(accessToken) &&
                (path.StartsWithSegments("/api/chathub")))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

var emailHost = builder.Configuration["EmailSender:Host"];
if (string.IsNullOrEmpty(emailHost))
{
    throw new InvalidOperationException("Email configuration is missing!");
}


builder.Services.AddAuthorization();

// Register your MovieContext
builder.Services.AddDbContext<MovieContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add ASP.NET Core Identity support
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

// CORS policy
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      policy =>
                      {
                      policy.WithOrigins("http://localhost:4200", // Angular dev server
                                         "https://your-production-angular-domain") // Angular production domain
                                .AllowAnyHeader()
                                .AllowAnyMethod()
                                .AllowCredentials();
                      });
});

builder.Services.AddSignalR();

builder.Services.AddScoped<JwtHandler>();

var app = builder.Build();

// Enable CORS
app.UseCors(MyAllowSpecificOrigins);

// Load configuration based on environment
builder.Configuration
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables();

if (app.Environment.IsDevelopment())
{
    builder.Configuration.AddUserSecrets<Program>();

    app.UseDeveloperExceptionPage(); // Add this line

    app.UseSwagger();
    app.UseSwaggerUI(); 

}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapHub<ChatHub>("/api/chathub"); // Map the ChatHub

app.Run();