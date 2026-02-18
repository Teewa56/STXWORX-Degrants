-- Add freelancerAddress column to applications table
ALTER TABLE applications ADD COLUMN freelancer_address VARCHAR(50) NOT NULL DEFAULT '';

-- Create index for faster lookups
CREATE INDEX idx_applications_freelancer_address ON applications(freelancer_address);
