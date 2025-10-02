export async function checkWriterApiAvailability(): Promise<{
  isAvailable: boolean;
  needsSetup: boolean;
  error?: string;
}> {
  // Check if running in Chrome
  const isChrome = navigator.userAgent.includes('Chrome');
  if (!isChrome) {
    return {
      isAvailable: false,
      needsSetup: true,
      error: 'PrepMate requires Google Chrome to use AI features'
    };
  }

  // Check Chrome version
  const match = navigator.userAgent.match(/Chrome\/(\d+)/);
  const chromeVersion = match ? parseInt(match[1], 10) : 0;
  if (chromeVersion < 138) {
    return {
      isAvailable: false,
      needsSetup: true,
      error: `Chrome version 138+ required (current: ${chromeVersion})`
    };
  }

  // Check if Writer API is available
  const writerGlobal = (window as any).Writer;
  if (!writerGlobal) {
    return {
      isAvailable: false,
      needsSetup: true,
      error: 'Writer API needs to be enabled in Chrome flags'
    };
  }

  try {
    const availability = await writerGlobal.availability();
    return {
      isAvailable: availability === 'available',
      needsSetup: availability === 'requires-install',
      error: availability === 'unavailable' ? 'Writer API is not available' : undefined
    };
  } catch (error) {
    return {
      isAvailable: false,
      needsSetup: true,
      error: 'Failed to check Writer API availability'
    };
  }
}