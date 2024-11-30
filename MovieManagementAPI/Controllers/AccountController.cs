using System.IdentityModel.Tokens.Jwt;
using Castle.Core.Smtp;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using MovieManagementAPI.Data;
using MovieManagementAPI.Models;

namespace MovieManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly MovieContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly JwtHandler _jwtHandler;
        private readonly IAppEmailSender _emailSender;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AccountController> _logger;


        public AccountController(
            MovieContext context,
            UserManager<ApplicationUser> userManager,
            JwtHandler jwtHandler,
            IAppEmailSender emailSender,
            IConfiguration configuration,
            ILogger<AccountController> logger

            )
        {
            _context = context;
            _userManager = userManager;
            _jwtHandler = jwtHandler;
            _emailSender = emailSender;
            _configuration = configuration;
            _logger = logger;

        }
        [HttpPost("Login")]
        public async Task<IActionResult> Login(ApiLoginRequest loginRequest)
        {
            var user = await _userManager.FindByNameAsync(loginRequest.Email);
            if (user == null
                || !await _userManager.CheckPasswordAsync(user, loginRequest.Password))
                return Unauthorized(new ApiLoginResult()
                {
                    Success = false,
                    Message = "Invalid Email or Password."
                });
            var secToken = await _jwtHandler.GetTokenAsync(user);
            var jwt = new JwtSecurityTokenHandler().WriteToken(secToken);
            return Ok(new ApiLoginResult()
            {
                Success = true,
                Message = "Login successful",
                Token = jwt
            });
        }
        [HttpPost("Register")]
        public async Task<IActionResult> Register(ApiRegisterRequest registerRequest)
        {
            var existingUser = await _userManager.FindByNameAsync(registerRequest.Email);
            if (existingUser != null)
                return Conflict(new ApiRegisterResult()
                {
                    Success = false,
                    Message = "User with this email already exists."
                });
            var newUser = new ApplicationUser()
            {
                Email = registerRequest.Email,
                UserName = registerRequest.Email,
                FirstName = registerRequest.FirstName,
                LastName = registerRequest.LastName
            };
            var isCreated = await _userManager.CreateAsync(newUser, registerRequest.Password);

            if (isCreated.Succeeded)
            {
                await _userManager.AddToRoleAsync(newUser, "RegisteredUser");
                return Ok(new ApiRegisterResult()
                {
                    Success = true,
                    Message = "User created successfully."
                });
            }
            return BadRequest(new ApiRegisterResult()
            {
                Success = false,
                Message = "User creation failed."
            });
        }
        [HttpPost("forgotpassword")]
        public async Task<IActionResult> ForgotPassword(ApiForgotPasswordRequest forgotPasswordRequest)
        {
            var user = await _userManager.FindByEmailAsync(forgotPasswordRequest.Email);
            if (user == null)
            {
                // Return generic success message to avoid exposing user existence
                return Ok(new ApiForgotPasswordResult()
                {
                    Success = true,
                    Message = "If the email is registered, a reset password link has been sent." 
                });
            }

            // Generate the reset password token
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);

            // Read the client URL from appsettings.json
            var clientUrl = _configuration["Client:ResetPasswordUrl"];
            if (string.IsNullOrEmpty(clientUrl))
            {
                return StatusCode(500, new ApiForgotPasswordResult
                {
                    Success = false,
                    Message = "Client URL is not configured."
                });
            }

            // Generate the reset password link
            var resetLink = QueryHelpers.AddQueryString(clientUrl, new Dictionary<string, string>
            {
                { "email", forgotPasswordRequest.Email },
                { "token", token }
            });

            // Send the email
            await _emailSender.SendEmailAsync(
                forgotPasswordRequest.Email,

                "Movie App Reset Password",
                $"Click <a href='{resetLink}'>here</a> to reset your password."
            );

            return Ok(new ApiForgotPasswordResult()
            {
                Success = true,
                Message = "If the email is registered, a reset password link has been sent."
            });
           
        }
        [HttpPost("resetpassword")]
        public async Task<IActionResult> ResetPassword(ApiResetPasswordRequest resetPasswordRequest)
        {
            var user = await _userManager.FindByEmailAsync(resetPasswordRequest.Email);

            try { 
            if (user == null)
            {
                return BadRequest(new ApiResetPasswordResult{
                    Success = false,
                    Message = "Invalid email." 
                });
            }

            if (resetPasswordRequest.NewPassword != resetPasswordRequest.ConfirmNewPassword)
                {
                    return BadRequest(new ApiResetPasswordResult
                    {
                        Success = false,
                        Message = "Passwords do not match."
                    });
                }

            // Validate the token 
            var isValidToken = await _userManager.VerifyUserTokenAsync(
                user,
                _userManager.Options.Tokens.PasswordResetTokenProvider,
                "ResetPassword",
                resetPasswordRequest.Token
            );

                if (!isValidToken) {
                    return BadRequest(new ApiResetPasswordResult
                    {
                        Success = false,
                        Message = "Invalid token."
                    });
                }

            var resetPasswordResult = await _userManager.ResetPasswordAsync(
            user,
            resetPasswordRequest.Token,
            resetPasswordRequest.NewPassword

            );

            if (resetPasswordResult.Succeeded)
            {
                return Ok(new ApiResetPasswordResult{
                    Success = true,
                    Message = "Password reset successfully." 
                });
            }
             var errors = string.Join(", ", resetPasswordResult.Errors.Select(e => e.Description));
             _logger.LogError("Password reset failed: {Errors}", errors);
                return BadRequest(new ApiResetPasswordResult{
                Success = false,
                Message = "Password reset failed.",
                Errors = resetPasswordResult.Errors.Select(e => e.Description).ToList()

                });
        }

            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while resetting the password.");
                return StatusCode(500, new ApiResetPasswordResult
                {
                    Success = false,
                    Message = "An error occurred while resetting the password."
                });
            }
        }
       
    }

}








