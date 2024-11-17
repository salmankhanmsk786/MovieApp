using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
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
        public AccountController(
            MovieContext context,
            UserManager<ApplicationUser> userManager,
            JwtHandler jwtHandler)
        {
            _context = context;
            _userManager = userManager;
            _jwtHandler = jwtHandler;
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
    }
}








