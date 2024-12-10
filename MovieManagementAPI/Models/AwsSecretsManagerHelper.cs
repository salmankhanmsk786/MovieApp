using Amazon.SecretsManager;
using Amazon.SecretsManager.Model;
using Newtonsoft.Json;

public class AwsSecretsManagerHelper
{
    private readonly IAmazonSecretsManager _secretsManager;

    public AwsSecretsManagerHelper(IAmazonSecretsManager secretsManager)
    {
        _secretsManager = secretsManager;
    }

    public async Task<T> GetSecretAsync<T>(string secretName) where T : class
    {
        var request = new GetSecretValueRequest
        {

            SecretId = secretName

        };

        var response = await _secretsManager.GetSecretValueAsync(request);
        return JsonConvert.DeserializeObject<T>(response.SecretString);
    }
};
