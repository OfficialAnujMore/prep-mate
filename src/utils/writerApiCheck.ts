interface DebugInfo {
  browser: string;
  chromeVersion?: number;
  userAgent: string;
  writerApiPresent: boolean;
  originTrialToken?: string;
  availabilityResponse?: string;
  error?: string;
  timestamp: string;
}

interface WriterApiStatus {
  isAvailable: boolean;
  needsSetup: boolean;
  error?: string;
  debugInfo: DebugInfo;
}

function getDebugInfo(): DebugInfo {
  const userAgent = navigator.userAgent;
  const isChrome = userAgent.includes('Chrome');
  const chromeMatch = userAgent.match(/Chrome\/(\d+)/);
  const chromeVersion = chromeMatch ? parseInt(chromeMatch[1], 10) : undefined;
  const browser = isChrome ? 'Chrome' : 'Non-Chrome';
  const writerApiPresent = 'Writer' in window;

  // Get the origin trial token from meta tag
  const metaTag = document.querySelector('meta[name="origin-trial"]');
  const originTrialToken = metaTag?.getAttribute('content') || undefined;

  return {
    browser,
    chromeVersion,
    userAgent,
    writerApiPresent,
    originTrialToken,
    timestamp: new Date().toISOString()
  };
}

function logDebugInfo(message: string, debugInfo: DebugInfo) {
  console.group('🔍 Writer API Debug Info');
  console.log('📝 Message:', message);
  console.log('🌐 Browser:', debugInfo.browser);
  console.log('📊 Chrome Version:', debugInfo.chromeVersion || 'N/A');
  console.log('🔑 Writer API Present:', debugInfo.writerApiPresent);
  console.log('📅 Timestamp:', debugInfo.timestamp);
  console.log('🏷️ Origin Trial Token:', debugInfo.originTrialToken ? 'Present' : 'Missing');
  console.log('🔍 Full User Agent:', debugInfo.userAgent);
  if (debugInfo.availabilityResponse) {
    console.log('✨ Availability Response:', debugInfo.availabilityResponse);
  }
  if (debugInfo.error) {
    console.error('❌ Error:', debugInfo.error);
  }
  console.groupEnd();
}

export async function checkWriterApiAvailability(): Promise<WriterApiStatus> {
  const debugInfo = getDebugInfo();

  // Check if running in Chrome
  const isChrome = debugInfo.browser === 'Chrome';
  if (!isChrome) {
    const result: WriterApiStatus = {
      isAvailable: false,
      needsSetup: true,
      error: 'PrepMate requires Google Chrome to use AI features',
      debugInfo
    };
    logDebugInfo('Browser check failed - Not Chrome', debugInfo);
    return result;
  }

  // Check Chrome version (Writer API requires Chrome 121+)
  if (debugInfo.chromeVersion && debugInfo.chromeVersion < 121) {
    const result: WriterApiStatus = {
      isAvailable: false,
      needsSetup: true,
      error: `Chrome version 121+ required (current: ${debugInfo.chromeVersion})`,
      debugInfo
    };
    logDebugInfo('Chrome version check failed', debugInfo);
    return result;
  }

  // Check if Writer API is available in window object
  if (!window.Writer) {
    const result: WriterApiStatus = {
      isAvailable: false,
      needsSetup: true,
      error: 'Writer API is not available. Please ensure Origin Trial is properly configured.',
      debugInfo
    };
    logDebugInfo('Writer API not found in window object', debugInfo);
    return result;
  }

  try {
    // Check API availability status
    const availability = await window.Writer.availability();
    debugInfo.availabilityResponse = availability;
    
    // Return appropriate status based on availability
    switch (availability) {
      case 'available':
        const result: WriterApiStatus = {
          isAvailable: true,
          needsSetup: false,
          debugInfo
        };
        logDebugInfo('Writer API is available and ready', debugInfo);
        return result;

      case 'requires-install':
        const requiresInstallResult: WriterApiStatus = {
          isAvailable: false,
          needsSetup: true,
          error: 'Writer API needs to be installed. Please check chrome://flags/#writer-api-for-gemini-nano',
          debugInfo
        };
        logDebugInfo('Writer API requires installation', debugInfo);
        return requiresInstallResult;

      case 'unavailable':
        const unavailableResult: WriterApiStatus = {
          isAvailable: false,
          needsSetup: true,
          error: 'Writer API is not available on this device or browser configuration',
          debugInfo
        };
        logDebugInfo('Writer API is unavailable', debugInfo);
        return unavailableResult;

      default:
        const unknownResult: WriterApiStatus = {
          isAvailable: false,
          needsSetup: true,
          error: 'Unknown Writer API availability status',
          debugInfo
        };
        logDebugInfo('Unknown Writer API status', debugInfo);
        return unknownResult;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    debugInfo.error = errorMessage;
    const result: WriterApiStatus = {
      isAvailable: false,
      needsSetup: true,
      error: error instanceof Error ? error.message : 'Failed to check Writer API availability',
      debugInfo
    };
    logDebugInfo('Error checking Writer API availability', debugInfo);
    return result;
  }
}