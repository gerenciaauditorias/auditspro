-- Create document_versions table
CREATE TABLE IF NOT EXISTS document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "documentId" UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version VARCHAR(10) NOT NULL,
    "fileUrl" TEXT,
    content TEXT,
    changes TEXT,
    "createdById" UUID NOT NULL REFERENCES users(id),
    "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Create document_permissions table
CREATE TABLE IF NOT EXISTS document_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "documentId" UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission VARCHAR(20) NOT NULL,
    "grantedById" UUID REFERENCES users(id),
    "grantedAt" TIMESTAMP DEFAULT NOW(),
    UNIQUE("documentId", "userId")
);

-- Create document_approvals table
CREATE TABLE IF NOT EXISTS document_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "documentId" UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    "reviewerId" UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL,
    comments TEXT,
    "reviewedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Create document_comments table
CREATE TABLE IF NOT EXISTS document_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "documentId" UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    "userId" UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    "parentCommentId" UUID REFERENCES document_comments(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);
