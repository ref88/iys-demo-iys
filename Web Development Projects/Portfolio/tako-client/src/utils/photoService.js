// Photo service for generating consistent, reliable photos
class PhotoService {
  constructor() {
    // Smaller, curated list of high-quality photos
    this.photoSets = {
      male: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=150&h=150&fit=crop&crop=face',
      ],
      female: [
        'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150&h=150&fit=crop&crop=face',
      ],
    };
  }

  // Generate a consistent photo based on resident data
  generatePhoto(resident) {
    const { gender = 'M', name = '', birthDate = '' } = resident;

    // Create a seed based on resident data for consistency
    const seed = this.createSeed(name, birthDate);

    // Select appropriate photo set
    const photoSet =
      gender === 'F' ? this.photoSets.female : this.photoSets.male;

    // Use seed to consistently select the same photo for the same resident
    const index = seed % photoSet.length;

    return photoSet[index];
  }

  // Generate avatar as fallback
  generateAvatar(name, gender = 'M') {
    if (!name) {
      return 'https://api.dicebear.com/7.x/initials/svg?seed=User&backgroundColor=6366f1&textColor=ffffff';
    }

    const colors =
      gender === 'F'
        ? ['ec4899', 'f97316', '8b5cf6', '06b6d4']
        : ['3b82f6', '10b981', 'f59e0b', 'ef4444'];

    const colorIndex = this.createSeed(name) % colors.length;
    const backgroundColor = colors[colorIndex];

    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=${backgroundColor}&textColor=ffffff`;
  }

  // Create consistent seed from string data
  createSeed(name = '', birthDate = '') {
    const str = (name + birthDate).toLowerCase().replace(/\s/g, '');
    let hash = 0;

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash);
  }

  // Validate if URL is accessible
  async validatePhoto(url) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Get photo with fallback chain
  async getPhotoWithFallback(resident) {
    const primaryPhoto = this.generatePhoto(resident);

    // Try primary photo first
    if (await this.validatePhoto(primaryPhoto)) {
      return primaryPhoto;
    }

    // Fallback to avatar
    return this.generateAvatar(resident.name, resident.gender);
  }

  // Preload important photos for better performance
  preloadPhotos(residents) {
    const photosToPreload = residents
      .slice(0, 20) // Only preload first 20 for performance
      .map((resident) => this.generatePhoto(resident));

    photosToPreload.forEach((photo) => {
      const img = new Image();
      img.src = photo;
    });
  }
}

export default new PhotoService();
