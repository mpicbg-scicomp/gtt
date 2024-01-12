if (Test-Path Env:\CERTIFICATE_P12) {
    # Which directory are we in right now?
    $workingDirectory = Convert-Path (Resolve-Path -path ".")

    # Absolute path to the certificate file we'll create
    $filename = "$workingDirectory\cert.p12"

    # Turn our base64 environment variable into usable bytes
    $bytes = [Convert]::FromBase64String($env:CERTIFICATE_P12)

    # Then, write them to disk
    [IO.File]::WriteAllBytes($filename, $bytes)

    # Finally, set the WINDOWS_CERTIFICATE_FILE environment variable
    $env:WINDOWS_CERTIFICATE_FILE = $filename
}

