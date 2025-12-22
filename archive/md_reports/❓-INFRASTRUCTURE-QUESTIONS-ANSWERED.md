# ❓ INFRASTRUCTURE QUESTIONS & ANSWERS - Historical Context

**Purpose**: Document how infrastructure information was gathered  
**Format**: Original Q&A format from deployment architecture interviews  
**Use**: Reference for understanding WHY certain decisions were made

---

## 📁 FILE STORAGE & DEPLOYMENT WORKFLOW

### **Question 1**: Where do you save all your project files locally?
- Example: `~/workforce-democracy-project/`
- Example: `/Users/yourname/Documents/workforce-project/`

**Answer**: `/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/`
- **Version Format**: `WDP-v[VERSION]-[FEATURE]` (e.g., `WDP-v37.12.5-BILLS-API`)
- **Note**: Version number in folder name changes with each update

**Why This Matters**: AI assistants need to know exact paths when creating deployment scripts that reference local files.

---

### **Question 2**: Do you keep frontend and backend files in separate folders?

**Answer**: Frontend and backend are in the SAME project folder.
- **Frontend files location**: `/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v[VERSION]/` (root of project folder)
- **Backend files location**: `/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v[VERSION]/backend/`

**Why This Matters**: When creating deployment scripts, must target `backend/` subfolder for VPS uploads, but entire folder for Netlify.

---

### **Question 3**: What is your exact drag-and-drop workflow?
- Do you drag the entire project folder?
- Do you drag only specific files/folders?

**Answer**: Downloads the entirety of the project (1,000+ files). The entire folder structure is uploaded to Netlify.

**Additional Context**: Frontend is actually hosted on Njalla - Netlify is only the deployment agent.

**Why This Matters**: AI assistants should never suggest "only upload changed files" - user uploads entire project each time.

---

### **Question 4**: How do you access Netlify?
- Via web browser
- Via CLI tool
- Other

**Answer**: Accesses Netlify website directly via browser (https://app.netlify.com/) and drags-and-drops the entire project folder into the web interface.

**Additional Context**: Has not used Netlify CLI.

**Why This Matters**: Don't provide CLI deployment instructions - user prefers GUI drag-and-drop method.

---

### **Question 5**: Where do you save backend files for VPS upload?

**Answer**: Backend files are in the `backend/` subfolder of current project version. Uploads directly from there.

**Local path**: `/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v[VERSION]/backend/`

**Do you use a specific "ready-to-upload" folder**: NO - uploads directly from current version folder.

**Why This Matters**: SCP commands should target the current version's `backend/` subfolder directly.

---

### **Question 6**: How do you upload backend files to VPS?

**Answer**: Uses SCP commands from Mac Terminal for file uploads, then SSH for executing commands on VPS.

**Methods Used**:
- ✅ SSH + terminal commands (copy/paste from deployment docs)
- ✅ SCP command (preferred for file uploads)
- ❌ SFTP client (FileZilla, Cyberduck, etc.) - NOT used

**Why This Matters**: Provide SCP commands in deployment scripts, not SFTP GUI instructions.

---

### **Question 7**: Do you always use the terminal upload commands from deployment docs?

**Answer**: YES - Follows provided deployment scripts and command sequences.

**Preference**: Copy/paste commands from deployment .sh files.

**Why This Matters**: AI assistants should provide complete, ready-to-run `.sh` deployment scripts with all commands.

---

## 🔧 VPS BACKEND CONFIGURATION

### **Question 8**: How is https://sxcrlfyt.gensparkspace.com whitelisted?

**Answer**: User has updated both Nginx and CORS headers but is not 100% sure which one handles which function.

**Configuration Updated**:
- ✅ Nginx configuration (both have been updated previously)
- ✅ CORS headers in backend (both have been updated previously)

**Verification Available**: VPS commands can be run if AI assistant needs to verify exact configuration.

**Why This Matters**: Both layers (Nginx + backend CORS) need to be configured for full functionality.

---

### **Question 9**: Are there other whitelisted domains we should know about?

**Answer**: User can provide this information via VPS command prompt if AI assistant requires it. Not documented at this time.

**How to Get**: Run VPS commands to check Nginx config and backend CORS settings.

**Why This Matters**: Don't assume only two domains are whitelisted - verify if adding new domains.

---

### **Question 11**: When you download files from GenSpark workspace, where do you save them?

**Answer**: Downloads from GenSpark are saved to the current active project version folder, overwriting existing files.

**Workflow**: Same folder as existing project files (overwrite).

**Why This Matters**: GenSpark downloads replace local files directly - no manual file copying needed.

---

### **Question 12**: Do you keep a backup of your project files?

**Answer**: YES - Maintains extensive backups in dedicated BACKUPS folder.

**Backup Location**: `/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/BACKUPS/`

**Backup Strategy**:
- Old versions are moved to backups before creating new version
- Automatic iCloud backups (many backup versions found in trash)

**Why This Matters**: User has comprehensive backup system - safe to overwrite files in current version folder.

---

### **Question 13**: How long does Netlify drag-and-drop deployment typically take?

**Answer**: Only takes seconds for Netlify to say "published" after drag-and-drop upload completes.

**Timing**: Immediate (< 30 seconds)

**Why This Matters**: Netlify deployment is very fast - don't warn user about "long deployment times."

---

### **Question 14**: Do you ever test changes locally before deploying to Netlify?

**Answer**: Always tests on the internet-published GenSpark link (https://sxcrlfyt.gensparkspace.com) PRIOR to deployment on Netlify.

**Workflow**: YES - Using GenSpark published site for testing.

**Benefit**: Saves on Netlify deployment credit usage every month. GenSpark site has full backend connectivity for complete testing.

**Why This Matters**: Always recommend testing on GenSpark first, then deploy to Netlify production.

---

### **Question 15**: For the secondary site (https://sxcrlfyt.gensparkspace.com/)

**Who manages/hosts this site**: GenSpark AI Developer Platform

**How do you deploy to this site**: Press "Publish Website" button in GenSpark workspace - automatic deployment

**Is this site for your testing only, or used by others**: Testing only (by user)

**Answer**: The site is managed within the GenSpark platform. User utilizes GenSpark AI developer services within the workspace. One-click "Publish Website" button automatically updates the site from all frontend work completed by AI assistants. The site is connected to the VPS backend, so all functionality (including LLM features) is available on this testing site. Used exclusively for testing before Netlify production deployment.

**Why This Matters**: GenSpark site is fully functional with live backend - perfect for full integration testing before production.

---

## 🎯 KEY INSIGHTS FROM Q&A

### **Deployment Workflow Preferences**:
1. ✅ Drag-and-drop entire project to Netlify (no git, no CLI)
2. ✅ SCP + SSH for backend deployment (terminal commands, not GUI)
3. ✅ Test on GenSpark first, then deploy to Netlify
4. ✅ Use provided .sh deployment scripts

### **File Management**:
1. ✅ Single project folder with version number in name
2. ✅ Backend in `backend/` subfolder
3. ✅ Comprehensive backup system (no fear of overwriting)
4. ✅ GenSpark downloads overwrite local files directly

### **Testing Philosophy**:
1. ✅ Always test on GenSpark live site first
2. ✅ Full backend connectivity available for testing
3. ✅ Saves Netlify credits by testing externally
4. ✅ Fast Netlify deployment (seconds) when ready for production

---

**Reference**: These Q&A responses shaped the deployment architecture in `🔒-CRITICAL-DEPLOYMENT-ARCHITECTURE-🔒.md`  
**Value**: Understanding the "why" behind infrastructure decisions helps AI assistants make better recommendations  
**Status**: Historical reference - see main document for current condensed facts
