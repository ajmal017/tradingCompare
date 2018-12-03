<?php

namespace AppBundle\SDK;

use Exception;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use GuzzleHttp\Exception\GuzzleException;

class ApiClient
{

    private $http;

    public function __construct(string $baseUri)
    {
        $this->http = new Client(
            [
                'base_uri' => $baseUri,
                'headers' => [
                    'Accept' => 'application/json',
                ]
            ]
        );
    }

    /**
     * @return array
     * @throws Exception
     */
    public function getUsers()
    {
        return $this->doGetRequest('trading-compare-v2/get-users');
    }

    /**
     * @param string $userIdentifier
     *
     * @return array|mixed
     * @throws Exception
     */
    public function getSentimentsByUser(string $userIdentifier)
    {
        $uri = '/get-sentiments-by-user/'.$userIdentifier;

        return $this->doGetRequest($uri);
    }

    /**
     * Helper method to send GET requests
     *
     * @param      $url
     *
     * @param null $queryParams
     *
     * @return array
     * @throws Exception
     */
    private function doGetRequest($url, $queryParams = null)
    {
        return $this->doRequestWithErrorParsing('GET', $url, $queryParams);
    }

    /**
     * Helper method to send POST requests
     *
     * @param string $uri
     * @param array  $formParams
     *
     * @return array
     * @throws Exception
     */
    private function doPostRequest(string $uri, array $formParams)
    {
        return $this->doRequestWithErrorParsing('POST', $uri, null, $formParams);
    }

    /**
     * Helper method to send DELETE requests
     *
     * @param $url
     *
     * @return bool
     * @throws GuzzleException
     * @throws Exception
     */
    private function doDeleteRequest($url)
    {
        $response = $this->doRequest('DELETE', $url);

        if ($response->getStatusCode() !== 200) {
            throw new Exception(
                $response->getReasonPhrase(),
                $response->getStatusCode()
            );
        }

        return true;
    }

    /**
     * @param string     $method
     * @param string     $endpoint
     * @param array|null $queryParams
     * @param array|null $formParams
     *
     * @return array|mixed
     * @throws Exception
     */
    private function doRequestWithErrorParsing(
        $method,
        $endpoint,
        array $queryParams = null,
        array $formParams = null
    ) {
        try {
            $response = $this->doRequest($method, $endpoint, $queryParams, $formParams);
        } catch (GuzzleException $e) {
            /** @var ClientException $e */
            // Try to convert error response to array
            $errors = json_decode($e->getResponse()->getBody(), true);

            if(!$errors) {
                $errors = ['error' => $e->getMessage()];
            }

            return $errors;
        }

        if ($response->getStatusCode() !== 201 && $response->getStatusCode() !== 200) {
            throw new Exception(
                $response->getReasonPhrase(),
                $response->getStatusCode()
            );
        }

        return json_decode($response->getBody(), true);
    }

    /**
     * Send a request to the API.
     *
     * @param  string    $method      The HTTP method.
     * @param  string    $endpoint    The endpoint.
     * @param  array     $queryParams The query params to send with the request.
     * @param array|null $formParams  The form params to send in POST requests.
     * @param array|null $multipart   The multiform params to send in POST request
     *
     * See: http://docs.guzzlephp.org/en/stable/request-options.html#multipart
     *
     * @return mixed|\Psr\Http\Message\ResponseInterface
     * @throws GuzzleException
     */
    private function doRequest(
        $method,
        $endpoint,
        array $queryParams = null,
        array $formParams = null,
        array $multipart = null
    ) {
        $options = [];
        if (!empty($queryParams)) {
            $options['query'] = $queryParams;
        }

        if (!empty($formParams)) {
            $options['form_params'] = $formParams;
        }

        if (!empty($multipart)) {
            $options['multipart'] = $multipart;
        }

        return $this->http->request($method, $endpoint, $options);
    }
}
